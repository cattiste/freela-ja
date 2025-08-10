// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  query,
  where,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc,
  limit,
} from 'firebase/firestore'
import { db } from '@/firebase'

// ---------------------------------------------
// util: distância geodésica (km)
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

// reconhece perfil de freela em modelos novo e legado
function ehFreela(data) {
  return (
    data?.tipoUsuario === 'freela' || // novo
    data?.tipo === 'freela' || // legado
    (data?.tipoConta === 'funcional' && data?.tipoUsuario === 'freela')
  )
}

// ---------------------------------------------
// card de freela
function FreelaCard({
  freela,
  distanciaKm,
  onChamar,
  chamando,
  observacao,
  setObservacao,
  isOnline,
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

        {distanciaKm != null && (
          <p className="text-sm text-gray-600 mt-1">
            📍 Aprox. {Number(distanciaKm).toFixed(1)} km do local
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📝 Observações para o freela
        </label>
        <textarea
          value={observacao[freelaKey] || ''}
          onChange={(e) =>
            setObservacao((prev) => ({ ...prev, [freelaKey]: e.target.value }))
          }
          placeholder="Ex: Use roupa preta, falar com gerente João..."
          className="w-full p-2 border rounded text-sm"
          rows={2}
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">
          ⚠️ Não inclua telefone, e-mail ou redes sociais.
        </p>
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

// ---------------------------------------------
// componente principal
export default function BuscarFreelas({ usuario, usuariosOnline = {} }) {
  const [onlineUids, setOnlineUids] = useState([]) // ['uid1','uid2',...]
  const [perfisOnline, setPerfisOnline] = useState([]) // perfis resolvidos a partir dos UIDs online
  const [perfisTodos, setPerfisTodos] = useState([]) // lista (limitada) de todos freelas
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [observacao, setObservacao] = useState({})
  const [mostrarTodos, setMostrarTodos] = useState(false) // alternar entre "online" e "todos"

  // 1) extrai UIDs realmente online do mapa
  useEffect(() => {
    const uids = Object.entries(usuariosOnline)
      .filter(([_, v]) => v?.online === true || v?.state === 'online')
      .map(([k]) => k)
    setOnlineUids(uids)
  }, [usuariosOnline])

  // 2) carrega perfis dos UIDs online (em lotes por campo uid; fallback por docId)
  useEffect(() => {
    let cancelado = false
    async function resolverPerfis() {
      try {
        setCarregando(true)
        const resultado = []

        // 'in' aceita no máx. 10 elementos
        const chunks = []
        for (let i = 0; i < onlineUids.length; i += 10)
          chunks.push(onlineUids.slice(i, i + 10))

        const encontradosPorUid = new Set()
        for (const arr of chunks) {
          if (arr.length === 0) continue
          const q = query(collection(db, 'usuarios'), where('uid', 'in', arr))
          const snap = await getDocs(q)
          snap.forEach((d) => {
            const data = d.data()
            if (ehFreela(data)) {
              resultado.push({ id: d.id, ...data })
            }
            if (data?.uid) encontradosPorUid.add(data.uid)
          })
        }

        // fallback: docId === uid para quem não tem campo uid
        const faltantes = onlineUids.filter((u) => !encontradosPorUid.has(u))
        for (const uid of faltantes) {
          const dref = doc(db, 'usuarios', uid)
          const dsnap = await getDoc(dref)
          if (dsnap.exists()) {
            const data = dsnap.data()
            if (ehFreela(data)) {
              resultado.push({ id: dsnap.id, ...data, uid: data.uid || uid })
            }
          }
        }

        if (!cancelado) setPerfisOnline(resultado)
      } catch (e) {
        console.error('[buscarfreelas] erro ao resolver perfis online:', e)
        if (!cancelado) setPerfisOnline([])
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    if (onlineUids.length > 0) resolverPerfis()
    else {
      setPerfisOnline([])
      setCarregando(false)
    }

    return () => {
      cancelado = true
    }
  }, [onlineUids])

  // 2b) (opcional) carregar lista geral de freelas (offline + online) quando solicitado
  useEffect(() => {
    let cancelado = false
    async function carregarTodos() {
      try {
        setCarregando(true)
        const outMap = new Map() // deduplica por uid || id

        // consulta modelo novo
        const qNovo = query(
          collection(db, 'usuarios'),
          where('tipoUsuario', '==', 'freela'),
          limit(60)
        )
        const s1 = await getDocs(qNovo)
        s1.forEach((d) => {
          const data = d.data()
          if (ehFreela(data)) {
            const key = data.uid || d.id
            if (!outMap.has(key)) outMap.set(key, { id: d.id, ...data })
          }
        })

        // consulta legado (caso ainda existam docs antigos)
        const qLegado = query(
          collection(db, 'usuarios'),
          where('tipo', '==', 'freela'),
          limit(60)
        )
        const s2 = await getDocs(qLegado)
        s2.forEach((d) => {
          const data = d.data()
          if (ehFreela(data)) {
            const key = data.uid || d.id
            if (!outMap.has(key)) outMap.set(key, { id: d.id, ...data })
          }
        })

        if (!cancelado) setPerfisTodos([...outMap.values()])
      } catch (e) {
        console.error('[buscarfreelas] erro ao carregar lista geral:', e)
        if (!cancelado) setPerfisTodos([])
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    if (mostrarTodos) carregarTodos()
    else setPerfisTodos([])

    return () => {
      cancelado = true
    }
  }, [mostrarTodos])

  // base de perfis conforme o modo
  const basePerfis = mostrarTodos ? perfisTodos : perfisOnline

  // 3) calcula distância e aplica filtro por função
  const freelasFiltrados = useMemo(() => {
    return basePerfis
      .map((f) => {
        const distanciaKm =
          f?.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null
        return { ...f, distanciaKm }
      })
      .filter(
        (f) =>
          !filtroFuncao ||
          f?.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
      )
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity))
  }, [basePerfis, filtroFuncao, usuario])

  // 4) chamar freela
  const chamarFreela = async (freela) => {
    if (!usuario?.uid) return
    const freelaUid = freela.uid || freela.id
    setChamando(freelaUid)

    const obs = (observacao[freelaUid] || '').trim()
    const contemContato =
      /(\d{4,}|\b(zap|whats|telefone|email|contato|instagram|arroba)\b)/i
    if (contemContato.test(obs)) {
      alert('🚫 Não inclua telefone, e-mail ou redes sociais nas instruções.')
      setChamando(null)
      return
    }

    try {
      // compat: identifica tipo do chamador nos esquemas novo/antigo
      const tipoChamador =
        usuario.tipo || // legado: 'pessoa_fisica' | 'estabelecimento'
        usuario.tipoUsuario || // novo
        usuario.subtipoComercial || null

      const pessoaFisicaUid =
        tipoChamador === 'pessoa_fisica' || usuario.subtipoComercial === 'pf'
          ? usuario.uid
          : null

      const estabelecimentoUid =
        tipoChamador === 'estabelecimento' ||
        usuario.subtipoComercial === 'estabelecimento'
          ? usuario.uid
          : null

      await addDoc(collection(db, 'chamadas'), {
        freelaUid,
        freelaNome: freela.nome,
        freelaFoto: freela.foto || '',
        freelaFuncao: freela.funcao || '',
        freela: {
          uid: freelaUid,
          nome: freela.nome,
          foto: freela.foto || '',
          funcao: freela.funcao || '',
        },

        chamadorUid: usuario.uid,
        chamadorNome: usuario.nome || '',
        tipoChamador: tipoChamador || '',
        pessoaFisicaUid,
        estabelecimentoUid,

        valorDiaria: freela.valorDiaria ?? null,
        observacao: obs,
        status: 'pendente',
        criadoEm: serverTimestamp(),
      })

      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      alert('Erro ao chamar freelancer.')
    } finally {
      setChamando(null)
    }
  }

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
      <div className="max-w-6xl mx-auto mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="button"
          onClick={() => setMostrarTodos((v) => !v)}
          className="px-4 py-2 rounded-lg bg-white/90 border border-orange-200 shadow-sm hover:shadow text-orange-700 font-medium"
        >
          {mostrarTodos ? 'Mostrar apenas ONLINE' : 'Ver também OFFLINE (recentes)'}
        </button>
      </div>

      {carregando ? (
        <p className="text-center text-white">Carregando freelancers...</p>
      ) : freelasFiltrados.length === 0 ? (
        <p className="text-center text-white">
          {mostrarTodos
            ? 'Nenhum freelancer encontrado.'
            : 'Nenhum freelancer online com essa função.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {freelasFiltrados.map((freela) => {
            const uid = freela.uid || freela.id
            const isOnline =
              !!usuariosOnline[uid] &&
              (usuariosOnline[uid].online === true ||
                usuariosOnline[uid].state === 'online')

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
