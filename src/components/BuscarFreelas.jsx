import React, { useEffect, useMemo, useState } from 'react'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import useStatusRTDB from '@/hooks/useStatusRTDB'

const TTL_MS = 120_000 // 2 minutos

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
  if (typeof v === 'string') return Date.parse(v)
  if (typeof v === 'object') {
    if (typeof v.toMillis === 'function') return v.toMillis()
    if (v.seconds) return v.seconds * 1000
  }
  return null
}

function estaOnline(status, now = Date.now()) {
  if (!status) return false
  const ts = toMillis(status.last_changed || status.updatedAt || status.lastSeen)
  const ativo = status?.state === 'online' || status?.online === true
  return ativo && ts && now - ts <= TTL_MS
}

export default function BuscarFreelas({ usuario }) {
  const [freelas, setFreelas] = useState([])
  const [filtro, setFiltro] = useState('')
  const usuariosOnline = useStatusRTDB()

  useEffect(() => {
    async function carregar() {
      const q = query(collection(db, 'usuarios'), where('tipoUsuario', '==', 'freela'), limit(60))
      const snap = await getDocs(q)
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setFreelas(lista)
    }
    carregar()
  }, [])

  const listaFinal = useMemo(() => {
    const agora = Date.now()

    return freelas
      .map(f => {
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

        return {
          ...f,
          online,
          distanciaKm
        }
      })
      .filter(f => !filtro || f.funcao?.toLowerCase().includes(filtro.toLowerCase()))
      .sort((a, b) => {
        if (a.online && !b.online) return -1
        if (!a.online && b.online) return 1
        return (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity)
      })
  }, [freelas, usuariosOnline, filtro, usuario])

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Buscar por função..."
        className="w-full mb-4 px-4 py-2 border rounded"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {listaFinal.length === 0 ? (
        <p className="text-white text-center">Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listaFinal.map((f) => (
            <div key={f.id} className="bg-white rounded-xl shadow p-4 border border-orange-200">
              <h3 className="text-orange-700 font-bold text-lg text-center">{f.nome}</h3>
              <p className="text-sm text-gray-600 text-center">{f.funcao}</p>
              {f.valorDiaria && (
                <p className="text-center text-sm mt-1">💰 R$ {f.valorDiaria} / diária</p>
              )}
              {f.distanciaKm && (
                <p className="text-center text-xs text-gray-500">
                  📍 {f.distanciaKm.toFixed(1)} km de você
                </p>
              )}
              <p className={`text-center mt-2 font-semibold ${f.online ? 'text-green-600' : 'text-gray-500'}`}>
                {f.online ? '🟢 Online agora' : '🔴 Offline'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
