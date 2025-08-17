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

import ProfissionalCardMini from '@/components/ProfissionalCardMini'
import ModalFreelaDetalhes from '@/components/ModalFreelaDetalhes'

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

function ehFreela(data) {
  return (
    data?.tipoUsuario === 'freela' ||
    data?.tipo === 'freela' ||
    (data?.tipoConta === 'funcional' && data?.tipoUsuario === 'freela')
  )
}

const TTL_PADRAO_MS = 120_000 // 2 minutos

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

// ---------------------------------------------
export default function BuscarFreelas({
  usuario,
  usuariosOnline = {},
  ttlMs = TTL_PADRAO_MS,
}) {
  const [onlineUids, setOnlineUids] = useState([])
  const [perfisOnline, setPerfisOnline] = useState([])
  const [perfisTodos, setPerfisTodos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const [modalFreela, setModalFreela] = useState(null)

  useEffect(() => {
    const now = Date.now()
    const uids = Object.entries(usuariosOnline)
      .filter(([_, v]) => estaOnline(v, now, ttlMs))
      .map(([k]) => k)
    setOnlineUids(uids)
  }, [usuariosOnline, ttlMs])

  useEffect(() => {
    let cancelado = false
    async function resolverPerfis() {
      try {
        setCarregando(true)
        const resultado = []

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

  useEffect(() => {
    let cancelado = false
    async function carregarTodos() {
      try {
        setCarregando(true)
        const outMap = new Map()

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

  const basePerfis = mostrarTodos ? perfisTodos : perfisOnline

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
            const isOnline = estaOnline(usuariosOnline[uid], Date.now(), ttlMs)

            return (
              <div
                key={uid}
                className="cursor-pointer"
                onClick={() => setModalFreela({ ...freela, isOnline })}
              >
                <ProfissionalCardMini
                  freela={freela}
                  usuario={usuario}
                  isOnline={isOnline}
                />
              </div>
            )
          })}
        </div>
      )}

      {modalFreela && (
        <ModalFreelaDetalhes
          freela={modalFreela}
          isOnline={modalFreela.isOnline}
          onClose={() => setModalFreela(null)}
        />
      )}
    </div>
  )
}
