// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, addDoc, serverTimestamp,
  getDocs, doc, getDoc, limit
} from 'firebase/firestore'
import { db } from '@/firebase'

// --- distância geodésica (km)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// --- presença com TTL: só é online se flag + timestamp recente
const TTL_MS = 120_000 // 2 min

function toMillis(v) {
  if (!v) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    if (/^\d+$/.test(v)) return Number(v) // epoch em string
    const p = Date.parse(v); return Number.isNaN(p) ? null : p
  }
  if (typeof v === 'object') {
    if (typeof v.toMillis === 'function') return v.toMillis()
    if (typeof v.seconds === 'number') return v.seconds * 1000
    if (typeof v._seconds === 'number') return v._seconds * 1000
  }
  return null
}

function estaOnline(rec, now) {
  if (!rec) return false
  const flag = rec.online === true || rec.state === 'online'
  const ts =
    rec.last_seen ??     // RTDB comum
    rec.lastSeen ??      // variação camelCase
    rec.ts ??            // genérico
    rec.updatedAt ??     // genérico
    rec.last_changed     // RTDB presence padrão
  const ms = toMillis(ts)
  if (!flag || ms == null) return false
  return now - ms <= TTL_MS
}

// --- reconhece perfil de freela (antigo/novo)
function ehFreela(data) {
  return (
    data?.tipo === 'freela' ||
    data?.tipoUsuario === 'freela' ||
    (data?.tipoConta === 'funcional' && data?.tipoUsuario === 'freela')
  )
}

function FreelaCard({
  freela,
  distanciaKm,
  onChamar,
  chamando,
  observacao,
  setObservacao,
  isOnline
}) {
  const freelaKey = freela.uid || freela.id
  return (
    <div className="p-4 bg-white rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition">
      <div className="flex flex-col items-center mb-3">
        <img
          src={freela.foto || 'https://via.placeholder.com/80'}
          alt={freela.nome}
          className="w-20 h-20 rounded-full object-cover border-2 border-orange-400"
        />
        <h3 className="mt-2 text-lg font-bold text-orange-700 text-center">{freela.nome}</h3>
        <p className="text-sm text-gray-600 text-center">{freela.funcao}</p>

        {freela.especialidades && (
          <p className="text-sm text-gray-500 text-center">
            {Array.isArray(freela.especialidades)
              ? freela.especialidades.join(', ')
              : freela.especialidades}
          </p>
        )}

        {freela.valorDiaria != null && freela.valorDiaria !== '' && (
          <p className="text-sm font-semibold text-orange-700 mt-1">
            💰 R$ {freela.valorDiaria} / diária
          </p>
        )}

        {typeof distanciaKm === 'number' && (
          <p className="text-sm text-gray-600 mt-1">
            📍 Aprox. {distanciaKm.toFixed(1)} km do local
          </p>
          
        )}

        {isOnline && (
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-700">🟢 Online agora</span>
          </div>
        )}
      </div>

      <div className="mb-2 w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">📝 Observações para o freela</label>
        <textarea
          value={observacao[freelaKey] || ''}
          onChange={(e) => setObservacao((prev) => ({ ...prev, [freelaKey]: e.target.value }))}
          placeholder="Ex: Use roupa preta, falar com gerente João..."
          className="w-full p-2 border rounded text-sm"
          rows={2}
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">⚠️ Não inclua telefone, e-mail ou redes sociais.</p>
      </div>

      <button
        onClick={() => onChamar(freela)}
        disabled={chamando === freelaKey}
        className="w-full py-2 px-4 rounded-lg font-semibold transition bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
      >
        {chamando === freelaKey ? 'Chamando...' : '📞 Chamar'}
      </button>
    </div>
  )
}

export default function BuscarFreelas({ usuario: usuarioProp, usuariosOnline = {} }) {
  const [usuario, setUsuario] = useState(usuarioProp || null) // fallback do localStorage se não vier por props
  const [onlineUids, setOnlineUids] = useState([])            // UIDs efetivamente online (TTL)
  const [perfis, setPerfis] = useState([])                    // perfis resolvidos a partir de UIDs (ou fallback)
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [observacao, setObservacao] = useState({})

  // fallback simples: tenta ler usuário do localStorage se não for passado por props
  useEffect(() => {
    if (!usuarioProp) {
      try {
        const raw = localStorage.getItem('usuarioLogado')
        if (raw) setUsuario(JSON.parse(raw))
      } catch {}
    } else {
      setUsuario(usuarioProp)
    }
  }, [usuarioProp])

  // 1) extrai UIDs online com TTL (evita ghosts)
  useEffect(() => {
    const now = Date.now()
    const uids = Object.entries(usuariosOnline)
      .filter(([_, v]) => estaOnline(v, now))
      .map(([k]) => k)
    setOnlineUids(uids)
  }, [usuariosOnline])

  // helper: fallback para listar freelas quando não há presença
  const carregarFreelasFallback = async () => {
    // duas queries (modelo antigo e novo), limitadas para evitar custo
    const resultado = []
    const seen = new Set()

    // tipo === 'freela'
    try {
      const q1 = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'), limit(60))
      const s1 = await getDocs(q1)
      s1.forEach(d => {
        if (!seen.has(d.id)) {
          resultado.push({ id: d.id, ...d.data() })
          seen.add(d.id)
        }
      })
    } catch {}

    // tipoUsuario === 'freela'
    try {
      const q2 = query(collection(db, 'usuarios'), where('tipoUsuario', '==', 'freela'), limit(60))
      const s2 = await getDocs(q2)
      s2.forEach(d => {
        if (!seen.has(d.id)) {
          resultado.push({ id: d.id, ...d.data() })
          seen.add(d.id)
        }
      })
    } catch {}

    return resultado
  }

  // 2) carrega perfis: se tiver online → resolve por UIDs; senão → fallback geral
  useEffect(() => {
    let cancelado = false
    async function carregar() {
      try {
        setCarregando(true)

        // tem online → busca só os online
        if (onlineUids.length > 0) {
          const resultado = []
          const chunks = []
          for (let i = 0; i < onlineUids.length; i += 10) chunks.push(onlineUids.slice(i, i + 10))

          const encontradosPorUid = new Set()
          for (const arr of chunks) {
            if (!arr.length) continue
            const q = query(collection(db, 'usuarios'), where('uid', 'in', arr))
            const snap = await getDocs(q)
            snap.forEach(d => {
              const data = d.data()
              if (ehFreela(data)) resultado.push({ id: d.id, ...data })
              if (data?.uid) encontradosPorUid.add(data.uid)
            })
          }

          // fallback docId === uid
          const faltantes = onlineUids.filter(u => !encontradosPorUid.has(u))
          for (const uid of faltantes) {
            const dref = doc(db, 'usuarios', uid)
            const dsnap = await getDoc(dref)
            if (dsnap.exists()) {
              const data = dsnap.data()
              if (ehFreela(data)) resultado.push({ id: dsnap.id, ...data, uid: data.uid || uid })
            }
          }

          if (!cancelado) setPerfis(resultado)
          return
        }

        // não tem online → lista geral (offline)
        const fallback = await carregarFreelasFallback()
        if (!cancelado) setPerfis(fallback)
      } catch (e) {
        console.error('[BuscarFreelas] erro ao carregar perfis:', e)
        if (!cancelado) setPerfis([])
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
  }, [onlineUids])

  // 3) calcula distância e aplica filtro por função
  const freelasFiltrados = useMemo(() => {
    return perfis
      .map((f) => {
        const distanciaKm =
          f.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null
        return { ...f, distanciaKm }
      })
      .filter((f) =>
        !filtroFuncao || f.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
      )
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity))
  }, [perfis, filtroFuncao, usuario])

  // 4) chamar freela
  const chamarFreela = async (freela) => {
    if (!usuario?.uid) return
    const freelaUid = freela.uid || freela.id
    setChamando(freelaUid)

    const obs = (observacao[freelaUid] || '').trim()
    const contemContato = /(\d{4,}|\b(zap|whats|telefone|email|contato|instagram|arroba)\b)/i
    if (contemContato.test(obs)) {
      alert('🚫 Não inclua telefone, e-mail ou redes sociais nas instruções.')
      setChamando(null)
      return
    }

    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid,
        freelaNome: freela.nome,
        freelaFoto: freela.foto || '',
        freelaFuncao: freela.funcao || '',
        freela: { uid: freelaUid, nome: freela.nome, foto: freela.foto || '', funcao: freela.funcao || '' },

        chamadorUid: usuario.uid,
        chamadorNome: usuario.nome || '',
        tipoChamador: usuario.tipo || usuario.tipoUsuario || usuario.subtipoComercial || '',
        pessoaFisicaUid: (usuario.tipo === 'pessoa_fisica' || usuario.subtipoComercial === 'pf') ? usuario.uid : null,
        estabelecimentoUid: (usuario.tipo === 'estabelecimento' || usuario.subtipoComercial === 'estabelecimento') ? usuario.uid : null,

        valorDiaria: freela.valorDiaria ?? null,
        observacao: obs,
        status: 'pendente',
        criadoEm: serverTimestamp()
      })

      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      alert('Erro ao chamar freelancer.')
    } finally {
      setChamando(null)
    }
  }

  const listaVazia = !carregando && freelasFiltrados.length === 0

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 pb-20"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="max-w-6xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {carregando ? (
        <p className="text-center text-white">Carregando freelancers...</p>
      ) : listaVazia ? (
        <p className="text-center text-white">Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {freelasFiltrados.map((freela) => {
            const uid = freela.uid || freela.id
            const isOnline = estaOnline(usuariosOnline[uid], Date.now())
            return (
              <FreelaCard
                key={uid}
                freela={freela}
                distanciaKm={freela.distanciaKm}
                onChamar={chamarFreela}
                chamando={chamando}
                observacao={observacao}
                setObservacao={setObservacao}
                isOnline={isOnline}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
