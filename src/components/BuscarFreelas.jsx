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
import useStatusRTDB from '@/hooks/useStatusRTDB'

const TTL_PADRAO_MS = 120_000 // 2 minutos

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

function toMillis(v) {
  if (!v) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const parsed = Date.parse(v)
    if (!Number.isNaN(parsed)) return parsed
    if (/^\d+$/.test(v)) return Number(v)
    return null
  }
  if (typeof v === 'object') {
    if (typeof v.toMillis === 'function') return v.toMillis()
    if (typeof v.seconds === 'number') return v.seconds * 1000
    if (typeof v._seconds === 'number') return v._seconds * 1000
  }
  return null
}

function estaOnline(rec, nowMs, ttlMs) {
  if (!rec) return false
  const flag = rec.online === true || rec.state === 'online'
  const ts =
    toMillis(rec.lastSeen) ??
    toMillis(rec.ts) ??
    toMillis(rec.updatedAt) ??
    toMillis(rec.last_changed) ??
    toMillis(rec.last_seen)
  if (ts == null) return flag
  return flag && nowMs - ts <= ttlMs
}

function ehFreela(data) {
  return (
    data?.tipoUsuario === 'freela' ||
    data?.tipo === 'freela' ||
    (data?.tipoConta === 'funcional' && data?.tipoUsuario === 'freela')
  )
}

function FreelaCard({ freela, distanciaKm, onChamar, chamando, observacao, setObservacao, isOnline }) {
  const freelaKey = freela.uid || freela.id
  return (
    <div className="p-4 bg-white rounded-2xl shadow-lg border border-orange-100">
      <div className="flex flex-col items-center mb-3">
        <img
          src={freela.foto || 'https://via.placeholder.com/80'}
          alt={freela.nome}
          className="w-20 h-20 rounded-full object-cover border-2 border-orange-400"
        />
        <h3 className="mt-2 text-lg font-bold text-orange-700 text-center">{freela.nome}</h3>
        <p className="text-sm text-gray-600 text-center">{freela.funcao}</p>
        {freela.valorDiaria != null && (
          <p className="text-sm font-semibold text-orange-700 mt-1">
            💰 R$ {freela.valorDiaria} / diária
          </p>
        )}
        {distanciaKm != null && (
          <p className="text-sm text-gray-600 mt-1">
            📍 {Number(distanciaKm).toFixed(1)} km do local
          </p>
        )}
        {isOnline && (
          <p className="text-xs text-green-700 mt-1">🟢 Online agora</p>
        )}
      </div>

      <textarea
        value={observacao[freelaKey] || ''}
        onChange={(e) => setObservacao((prev) => ({ ...prev, [freelaKey]: e.target.value }))}
        placeholder="Ex: Instruções específicas..."
        className="w-full p-2 border rounded text-sm mb-2"
        rows={2}
        maxLength={200}
      />

      <button
        onClick={() => onChamar(freela)}
        disabled={chamando === freelaKey}
        className="w-full py-2 px-4 rounded-lg font-semibold bg-orange-500 text-white"
      >
        {chamando === freelaKey ? 'Chamando...' : '📞 Chamar'}
      </button>
    </div>
  )
}

export default function BuscarFreelas({ usuario, ttlMs = TTL_PADRAO_MS }) {
  const [perfis, setPerfis] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [chamando, setChamando] = useState(null)
  const [observacao, setObservacao] = useState({})

  const usuariosOnline = useStatusRTDB()
  const onlineUids = useMemo(() => {
    const now = Date.now()
    return Object.entries(usuariosOnline)
      .filter(([_, v]) => estaOnline(v, now, ttlMs))
      .map(([k]) => k)
  }, [usuariosOnline, ttlMs])

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const snap = await getDocs(collection(db, 'usuarios'))
      const lista = []
      snap.forEach((doc) => {
        const data = doc.data()
        if (ehFreela(data)) lista.push({ id: doc.id, ...data })
      })
      setPerfis(lista)
      setCarregando(false)
    }
    carregar()
  }, [])

  const perfisFiltrados = useMemo(() => {
    return perfis
      .filter((f) => mostrarTodos || onlineUids.includes(f.uid || f.id))
      .map((f) => {
        const distanciaKm = f?.coordenadas && usuario?.coordenadas
          ? calcularDistancia(
              usuario.coordenadas.latitude,
              usuario.coordenadas.longitude,
              f.coordenadas.latitude,
              f.coordenadas.longitude
            )
          : null
        return { ...f, distanciaKm }
      })
      .filter((f) => !filtroFuncao || f?.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase()))
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity))
  }, [perfis, onlineUids, mostrarTodos, filtroFuncao, usuario])

  const chamarFreela = async (freela) => {
    if (!usuario?.uid) return
    const freelaUid = freela.uid || freela.id
    setChamando(freelaUid)
    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid,
        freelaNome: freela.nome,
        chamadorUid: usuario.uid,
        chamadorNome: usuario.nome,
        valorDiaria: freela.valorDiaria ?? null,
        observacao: observacao[freelaUid] || '',
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
    <div className="p-4 pb-20 bg-cover bg-center" style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}>
      <div className="max-w-6xl mx-auto mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300"
        />
        <button
          onClick={() => setMostrarTodos((v) => !v)}
          className="px-4 py-2 rounded-lg border bg-white text-orange-700"
        >
          {mostrarTodos ? 'Mostrar apenas ONLINE' : 'Ver também OFFLINE'}
        </button>
      </div>

      {carregando ? (
        <p className="text-center text-white">Carregando freelancers...</p>
      ) : perfisFiltrados.length === 0 ? (
        <p className="text-center text-white">Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {perfisFiltrados.map((freela) => (
            <FreelaCard
              key={freela.uid || freela.id}
              freela={freela}
              distanciaKm={freela.distanciaKm}
              onChamar={chamarFreela}
              chamando={chamando}
              observacao={observacao}
              setObservacao={setObservacao}
              isOnline={onlineUids.includes(freela.uid || freela.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
