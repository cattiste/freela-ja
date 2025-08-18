// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, getDocs, limit
} from 'firebase/firestore'
import { db } from '@/firebase'
import useStatusRTDB from '@/hooks/useStatusRTDB'
import ProfissionalCardMini from './ProfissionalCardMini'

const TTL_PADRAO_MS = 120_000

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2
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
  }
  return null
}

function estaOnline(status, now, ttl = TTL_PADRAO_MS) {
  if (!status) return false
  const flag = status.state === 'online' || status.online === true
  const ts = toMillis(status.lastSeen) || toMillis(status.last_changed) || toMillis(status.updatedAt)
  return flag && now - ts <= ttl
}

export default function BuscarFreelas({ usuario }) {
  const [freelas, setFreelas] = useState([])
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [chamando, setChamando] = useState(null)
  const [observacao, setObservacao] = useState({})
  const usuariosOnline = useStatusRTDB()
  const now = Date.now()

  useEffect(() => {
    async function carregar() {
      const snap = await getDocs(
        query(collection(db, 'usuarios'), where('tipoUsuario', '==', 'freela'), limit(60))
      )
      const lista = []
      snap.forEach((docu) => {
        const data = docu.data()
        const id = docu.id
        if (data) lista.push({ ...data, id })
      })
      setFreelas(lista)
    }
    carregar()
  }, [])

  const freelasFiltrados = useMemo(() => {
    const agora = Date.now()
    return freelas
      .map((f) => {
        const status = usuariosOnline[f.uid || f.id]
        const online = estaOnline(status, agora)
        const distanciaKm =
          f?.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null
        return { ...f, online, distanciaKm }
      })
      .filter((f) => f.online)
      .filter((f) =>
        !filtroFuncao || f?.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
      )
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity))
  }, [freelas, usuariosOnline, filtroFuncao, usuario])

  function handleChamar(freela) {
    const freelaUid = freela.uid || freela.id
    setChamando(freelaUid)
    setTimeout(() => {
      setChamando(null)
      alert(`Chamada enviada para ${freela.nome}!\n\nObs: ${observacao[freelaUid] || '(sem observações)'}`)
    }, 1000)
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <input
        type="text"
        placeholder="Buscar por função..."
        className="w-full mb-4 px-4 py-2 border rounded shadow"
        value={filtroFuncao}
        onChange={(e) => setFiltroFuncao(e.target.value)}
      />

      {freelasFiltrados.length === 0 ? (
        <p className="text-white text-center">Nenhum freelancer online encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {freelasFiltrados.map((freela) => (
            <ProfissionalCardMini
              key={freela.uid || freela.id}
              freela={freela}
              usuario={usuario}
              onChamar={handleChamar}
              chamando={chamando}
              observacao={observacao}
              setObservacao={setObservacao}
              online={freela.online}
            />
          ))}
        </div>
      )}
    </div>
  )
}
