// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, addDoc, serverTimestamp,
  getDocs, limit, setDoc, doc
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

function FreelaCard({ freela, online, distancia, onChamar, chamando, observacao, setObservacao, onAbrirPagamento }) {

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
      {/* 💳 Botão de pagamento */}
      <button
        onClick={() => onAbrirPagamento(freela)}
        className="mt-2 w-full py-2 rounded-lg font-bold bg-orange-600 hover:bg-orange-700 text-white"
      >
        💳 Pagar Freela
      </button>
       {/* 📞 Botão de chamada */}
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
  const [freelaSelecionado, setFreelaSelecionado] = useState(null);

  useEffect(() => {
    async function carregarFreelas() {
      const lista = []

      const q1 = query(collection(db, 'usuarios'), where('tipoUsuario', '==', 'freela'), limit(60))
      const q2 = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'), limit(60))

      const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)])
      s1.forEach((d) => lista.push({ id: d.id, ...d.data() }))
      s2.forEach((d) => lista.push({ id: d.id, ...d.data() }))

      // Cálculo de média de avaliações
      for (const f of lista) {
try {
  const uidAlvo = f.uid || f.id;
  if (uidAlvo) {
    const avalSnap = await getDocs(
      query(collection(db, 'avaliacoesFreelas'), where('freelaId', '==', uidAlvo))
    );
    const avals = avalSnap.docs.map((d) => d.data());
    if (avals.length > 0) {
      const media = avals.reduce((sum, a) => sum + (a.nota || 0), 0) / avals.length;
      f.mediaAvaliacoes = media;
    }
  }
} catch (e) {
  console.warn('[BuscarFreelas] Sem permissão para ler avaliacoesFreelas:', e);
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
        const distancia = f.coordenadas && usuario?.coordenadas
          ? calcularDistancia(
              usuario.coordenadas.latitude,
              usuario.coordenadas.longitude,
              f.coordenadas.latitude,
              f.coordenadas.longitude
            )
          : null
        const online = estaOnline(usuariosOnline[f.uid || f.id])
        return { ...f, distancia, online }
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
  }, [freelas, filtro, usuario, usuariosOnline])

  const chamar = async (freela) => {
    const uid = freela.uid || freela.id
    setChamando(uid)

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

      // 🔁 Criar espelho do freela na coleção pagamentos_usuarios
      const pagamentoRef = doc(db, 'pagamentos_usuarios', chamadaRef.id)
      await setDoc(pagamentoRef, {
        chamadaId: chamadaRef.id,
        freelaUid: uid,
        freelaNome: freela.nome,
        pixFreela: freela.chavePix || '',
        valorDiaria: freela.valorDiaria || 0,
        status: 'pendente',
        criadoEm: serverTimestamp()
      })

      alert(`✅ ${freela.nome} foi chamado com sucesso!`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      alert('Erro ao chamar freelancer.')
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
              onAbrirPagamento={(freela) => setFreelaSelecionado(freela)}
            />
          ))}
        </div>
      )}
        {freelaSelecionado && (
        <ModalPagamentoFreela
          freela={freelaSelecionado}
          onClose={() => setFreelaSelecionado(null)}
        />
      )}
    </div>
  )
}