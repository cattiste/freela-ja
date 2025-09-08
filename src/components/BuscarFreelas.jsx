// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, addDoc, serverTimestamp,
  getDocs, limit, setDoc, doc, onSnapshot
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

export default function BuscarFreelas({ usuario, usuariosOnline = {} }) {
  const [freelas, setFreelas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [chamando, setChamando] = useState(null)
  const [observacao, setObservacao] = useState({})
  const [freelaSelecionado, setFreelaSelecionado] = useState(null)
  const [statusChamadas, setStatusChamadas] = useState({})

  useEffect(() => {
    const q = query(collection(db, 'chamadas'), where('contratanteUid', '==', usuario.uid))
    const unsub = onSnapshot(q, snap => {
      const dados = {}
      snap.forEach(doc => {
        const d = doc.data()
        dados[d.freelaUid] = {
          status: d.status,
          chamadaId: doc.id
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
        const chamadaId = chamada.chamadaId
        return { ...f, distancia, online, podePagar, chamadaId }
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

      const chamadaRef = await addDoc(collection(db, 'chamadas'), {
        freelaUid: uid,
        freelaNome: freela.nome,
        valorDiaria: freela.valorDiaria || null,
        contratanteUid: usuario.uid,
        contratanteNome: usuario.nome || '',
        tipoContratante: usuario.tipo || usuario.tipoUsuario || '',
        observacao: observacao[uid] || '',
        status: 'pendente',
        criadoEm: serverTimestamp()
      })
      chamadaId = chamadaRef.id

      try {
        const diaria = Number(freela.valorDiaria || 0)
        await setDoc(doc(db, 'pagamentos_usuarios', chamadaId), {
          chamadaId,
          contratanteUid: usuario.uid,
          freelaUid: uid,
          freelaNome: freela.nome || '',
          cpfContratante: usuario.cpf || '',
          contratanteNome: usuario.nome || '',
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
              onAbrirPagamento={() => {
                console.log('[PAGAMENTO] clicado:', f.nome, f.chamadaId)
                setFreelaSelecionado({ ...f, chamadaId: f.chamadaId })
              }}
              podePagar={f.podePagar}
            />
          ))}
        </div>
      )}

      {freelaSelecionado && (
        <ModalPagamentoFreela
          freela={freelaSelecionado}
          pagamentoDocId={freelaSelecionado.chamadaId}
          onClose={() => setFreelaSelecionado(null)}
        />
      )}
    </div>
  )
}