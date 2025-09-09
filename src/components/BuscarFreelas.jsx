// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, addDoc, serverTimestamp,
  getDocs, limit, setDoc, doc, onSnapshot, orderBy
} from 'firebase/firestore'
import { db } from '@/firebase'
import { FaStar, FaRegStar } from 'react-icons/fa'
import ModalPagamentoFreela from './ModalPagamentoFreela'

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

const TTL_MS = 120_000
function toMillis(v) {
  if (!v) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') return /^\d+$/.test(v) ? Number(v) : Date.parse(v)
  if (typeof v === 'object') {
    if (typeof v.toMillis === 'function') return v.toMillis()
    if (typeof v.seconds === 'number') return v.seconds * 1000
  }
  return null
}

function estaOnline(rec) {
  const now = Date.now()
  if (!rec) return false
  const flag = rec.online === true || rec.state === 'online'
  const ts =
    toMillis(rec.lastSeen) ?? toMillis(rec.ts) ?? toMillis(rec.last_changed)
  return flag && now - ts <= TTL_MS
}

function Estrelas({ media }) {
  const cheias = Math.floor(media)
  const meia = media % 1 >= 0.5
  const vazias = 5 - cheias - (meia ? 1 : 0)
  return (
    <div className="flex justify-center mt-1 text-yellow-400">
      {[...Array(cheias)].map((_, i) => <FaStar key={'c' + i} />)}
      {meia && <FaStar className="opacity-50" />}
      {[...Array(vazias)].map((_, i) => <FaRegStar key={'v' + i} />)}
    </div>
  )
}

function FreelaCard({
  freela, online, distancia, onChamar, chamando,
  observacao, setObservacao, onAbrirPagamento, podePagar
}) {
  const uid = freela.uid || freela.id

  return (
    <div className="p-4 bg-white rounded-2xl shadow-lg border border-orange-100 flex flex-col items-center">
      <img
        src={freela.foto || 'https://via.placeholder.com/80'}
        alt={freela.nome}
        className="w-20 h-20 rounded-full object-cover border-2 border-orange-400"
      />
      <h3 className="mt-2 text-lg font-bold text-orange-700">{freela.nome}</h3>
      <p className="text-sm text-gray-600">{freela.funcao}</p>
      {freela.especialidades && (
        <p className="text-xs text-gray-500 text-center">
          {Array.isArray(freela.especialidades) ? freela.especialidades.join(', ') : freela.especialidades}
        </p>
      )}
      {freela.mediaAvaliacoes ? (
        <Estrelas media={freela.mediaAvaliacoes} />
      ) : (
        <p className="text-xs text-gray-400">(sem avaliações)</p>
      )}
      {freela.valorDiaria && (
        <p className="text-sm font-semibold text-orange-700 mt-1">💰 R$ {freela.valorDiaria}</p>
      )}
      {distancia != null && (
        <p className="text-sm text-gray-600 mt-1">📍 {distancia.toFixed(1)} km</p>
      )}
      {online && (
        <div className="flex items-center gap-1 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-700">Online agora</span>
        </div>
      )}
      <textarea
        rows={2}
        className="w-full mt-3 px-2 py-1 border rounded text-sm"
        placeholder="Instruções (ex: roupa preta)"
        value={observacao[uid] || ''}
        onChange={(e) => setObservacao((prev) => ({ ...prev, [uid]: e.target.value }))}
      />
      {podePagar && (
        <button
          onClick={onAbrirPagamento}
          className="mt-2 w-full py-2 rounded-lg font-bold bg-orange-600 hover:bg-orange-700 text-white"
        >
          💳 Pagar Freela
        </button>
      )}
      <button
        onClick={() => onChamar(freela)}
        disabled={!online || chamando === uid}
        className={`mt-3 w-full py-2 rounded-lg font-bold transition ${
          online
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-400 text-white cursor-not-allowed'
        }`}
      >
        {chamando === uid ? 'Chamando...' : '📞 Chamar'}
      </button>
    </div>
  )
}

export default function BuscarFreelas({ usuario, usuariosOnline = {} }) {
  const [freelas, setFreelas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [chamando, setChamando] = useState(null)
  const [observacao, setObservacao] = useState({})
  const [freelaSelecionado, setFreelaSelecionado] = useState(null)
  const [statusChamadas, setStatusChamadas] = useState({})

  useEffect(() => {
    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', usuario.uid),
      where('status', 'in', ['pendente', 'aceita'])
    )

    const unsub = onSnapshot(q, snap => {
      const dados = {}
      snap.forEach((docSnap) => {
        const d = docSnap.data()
        const existente = dados[d.freelaUid]

        if (!existente || (d.criadoEm?.seconds || 0) > (existente.criadoEm?.seconds || 0)) {
          dados[d.freelaUid] = {
            id: docSnap.id,
            status: d.status,
            ...d,
          }
        }
      })
      setStatusChamadas(dados)
    })

    return () => unsub()
  }, [usuario.uid])

  useEffect(() => {
    async function carregarFreelas() {
      const lista = []

      const q1 = query(collection(db, 'usuarios'), where('tipoUsuario', '==', 'freela'), limit(60))
      const q2 = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'), limit(60))

      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)])
      s1.forEach((d) => lista.push({ id: d.id, ...d.data() }))
      s2.forEach((d) => lista.push({ id: d.id, ...d.data() }))

      for (const f of lista) {
        const avalSnap = await getDocs(query(collection(db, 'avaliacoes'), where('freelaId', '==', f.uid || f.id)))
        const avals = avalSnap.docs.map((d) => d.data())
        if (avals.length > 0) {
          const media = avals.reduce((sum, a) => sum + (a.nota || 0), 0) / avals.length
          f.mediaAvaliacoes = media
        }
      }

      const unicos = new Map()
      lista.forEach((f) => {
        const id = f.uid || f.id
        if (!unicos.has(id)) unicos.set(id, f)
      })

      setFreelas([...unicos.values()])
    }

    carregarFreelas()
  }, [])

  const filtrados = useMemo(() => {
    return freelas
      .map((f) => {
        const uid = f.uid || f.id
        const distancia = f.coordenadas && usuario?.coordenadas
          ? calcularDistancia(
              usuario.coordenadas.latitude,
              usuario.coordenadas.longitude,
              f.coordenadas.latitude,
              f.coordenadas.longitude
            )
          : null
        const online = estaOnline(usuariosOnline[uid])
        const chamada = statusChamadas[uid] || {}
        const podePagar = chamada.status === 'aceita'
        const chamadaId = chamada.id // ✅ CORRIGIDO: usar chamada.id
        
        console.log('Freela:', f.nome, 'Status:', chamada.status, 'Pode pagar:', podePagar, 'Chamada ID:', chamadaId)
        
        return { ...f, distancia, online, podePagar, chamadaId, uid }
      })
      .filter((f) => !filtro || f.funcao?.toLowerCase().includes(filtro.toLowerCase()))
      .sort((a, b) => {
        if (a.online && !b.online) return -1
        if (!a.online && b.online) return 1
        if (a.distancia != null && b.distancia != null) {
          return a.distancia - b.distancia
        }
        return 0
      })
  }, [freelas, filtro, usuario, usuariosOnline, statusChamadas])

  const chamar = async (freela) => {
    const uid = freela.uid || freela.id
    setChamando(uid)
    let chamadaId = null

    try {
      const snap = await getDocs(query(
        collection(db, 'chamadas'),
        where('freelaUid', '==', uid),
        where('contratanteUid', '==', usuario.uid),
        where('status', 'in', ['pendente', 'aceita', 'confirmada', 'em_andamento'])
      ))
      if (!snap.empty) {
        alert('⚠️ Você já chamou esse freela e a chamada está ativa.')
        return
      }

      const chamadaRef = doc(collection(db, "chamadas"))
      await setDoc(chamadaRef, {
        id: chamadaRef.id,
        freelaUid: freela.uid || freela.id,
        freelaNome: freela.nome,
        contratanteUid: usuario.uid,
        contratanteNome: usuario.nome,
        valorDiaria: freela.valorDiaria,
        status: "pendente",
        criadoEm: serverTimestamp(),
      })
      chamadaId = chamadaRef.id
      console.log('Chamada criada com ID:', chamadaId)

      try {
        const diaria = Number(freela.valorDiaria || 0)
        await setDoc(doc(db, 'pagamentos_usuarios', chamadaId), {
          chamadaId,
          contratanteUid: usuario.uid,
          freelaUid: uid,
          freelaNome: freela.nome || '',
          cpfContratante: usuario.responsavelCPF || usuario.cpf || '',
          contratanteNome: usuario.responsavelNome || usuario.nome || '',
          valorDiaria: diaria,
          valorContratante: +(diaria * 1.10).toFixed(2),
          valorFreela: +(diaria * 0.90).toFixed(2),
          status: 'pendente',
          criadoEm: serverTimestamp()
        }, { merge: true })
      } catch (e) {
        console.warn('[pagamentos_usuarios] best-effort falhou:', e)
      }

      alert(`✅ ${freela.nome} foi chamado com sucesso!`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      if (chamadaId) {
        alert('✅ Chamada criada. ⚠️ Não foi possível preparar o pagamento agora (permissão).')
      } else {
        alert('Erro ao chamar freelancer.')
      }
    } finally {
      setChamando(null)
    }
  }

  const handleAbrirPagamento = (freela) => {
    const chamada = statusChamadas[freela.uid || freela.id]
    if (chamada?.status === 'aceita') {
      console.log('Abrindo pagamento para chamada ID:', chamada.id)
      setFreelaSelecionado({ 
        ...freela, 
        chamada // ✅ Envia a chamada completa
      })
    } else {
      alert('Chamada ainda não está no status "aceita".')
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center p-4 pb-20"
      style={{ backgroundImage: `url('/img/fundo-login.jpg')`, backgroundAttachment: 'fixed' }}>
      <div className="max-w-4xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {filtrados.length === 0 ? (
        <p className="text-center text-white">Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filtrados.map((f) => (
            <FreelaCard
              key={f.uid || f.id}
              freela={f}
              online={f.online}
              distancia={f.distancia}
              onChamar={chamar}
              chamando={chamando}
              observacao={observacao}
              setObservacao={setObservacao}
              onAbrirPagamento={() => handleAbrirPagamento(f)}
              podePagar={f.podePagar}
            />
          ))}
        </div>
      )}

      {freelaSelecionado && freelaSelecionado.chamada && (
        <ModalPagamentoFreela
          freela={freelaSelecionado}
          pagamentoDocId={freelaSelecionado.chamada.id} // ✅ Agora usa chamada.id
          onClose={() => setFreelaSelecionado(null)}
        />
      )}
    </div>
  )
}