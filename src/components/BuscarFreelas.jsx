// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, onSnapshot, doc, getDoc
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

// --- Fallback de avatar (sem depender de via.placeholder.com)
const AvatarFallback = ({ className }) => (
  <div className={`flex items-center justify-center bg-orange-100 text-orange-600 rounded-full ${className}`}>
    <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" aria-hidden="true">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 4.5V21h16v-2.5C20 16.17 16.33 14 12 14Z" />
    </svg>
  </div>
)

// --- distância geodésica (km)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number'
  ) return null

  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function BuscarFreelas({ usuario: usuarioProp }) {
  // permite receber o estabelecimento por prop ou cair no contexto
  const { usuario: usuarioCtx } = useAuth()
  const usuario = usuarioProp || usuarioCtx

  const [estab, setEstab] = useState(null) // doc do estabelecimento (para pegar localizacao)
  const [freelasRaw, setFreelasRaw] = useState([]) // docs de usuarios tipo 'freela'
  const [onlineSet, setOnlineSet] = useState(() => new Set()) // UIDs online (de /status)
  const [apenasOnline, setApenasOnline] = useState(false)
  const [filtroFuncao, setFiltroFuncao] = useState('') // opcional, por função/cargo
  const [carregando, setCarregando] = useState(true)

  // 1) Buscar dados do estabelecimento logado (para ter localizacao)
  useEffect(() => {
    let ativo = true
    async function loadEstab() {
      if (!usuario?.uid) return
      const ref = doc(db, 'usuarios', usuario.uid)
      const snap = await getDoc(ref)
      if (ativo) {
        setEstab(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      }
    }
    loadEstab()
    return () => { ativo = false }
  }, [usuario?.uid])

  // 2) Escutar freelas (coleção usuarios)
  useEffect(() => {
    setCarregando(true)
    const qUsuarios = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
    const unsub = onSnapshot(qUsuarios, (snap) => {
      const list = []
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }))
      setFreelasRaw(list)
      setCarregando(false)
    }, (err) => {
      console.error('[BuscarFreelas] onSnapshot usuarios erro:', err)
      setCarregando(false)
    })
    return () => unsub()
  }, [])

  // 3) Escutar /status (apenas os online) — marcamos como online se houver state === 'online'
  useEffect(() => {
    const qStatusOnline = query(collection(db, 'status'), where('state', '==', 'online'))
    const unsub = onSnapshot(qStatusOnline, (snap) => {
      const setNovo = new Set()
      snap.forEach((d) => setNovo.add(d.id)) // id do doc = uid do usuário
      setOnlineSet(setNovo)
    }, (err) => {
      console.error('[BuscarFreelas] onSnapshot status erro:', err)
    })
    return () => unsub()
  }, [])

  // 4) Montar lista com distância e status online
  const freelasDecorados = useMemo(() => {
    const latE = estab?.localizacao?.latitude
    const lonE = estab?.localizacao?.longitude

    return freelasRaw
      .map((f) => {
        const latF = f?.localizacao?.latitude
        const lonF = f?.localizacao?.longitude
        const distanciaKm = (typeof latE === 'number' && typeof lonE === 'number' && typeof latF === 'number' && typeof lonF === 'number')
          ? calcularDistancia(latE, lonE, latF, lonF)
          : null

        const online = onlineSet.has(f.id)

        return {
          ...f,
          online,
          distanciaKm,
        }
      })
      .filter((f) => {
        // filtro por função (se preenchido)
        const okFuncao = filtroFuncao
          ? (String(f.funcao || '').toLowerCase().includes(filtroFuncao.toLowerCase()) ||
             String(f.especialidade || '').toLowerCase().includes(filtroFuncao.toLowerCase()))
          : true

        // se "apenasOnline", filtra
        const okOnline = apenasOnline ? f.online === true : true

        return okFuncao && okOnline
      })
      .sort((a, b) => {
        // 1) online primeiro
        if (a.online !== b.online) return a.online ? -1 : 1
        // 2) distância (nulls vão pro fim)
        if (a.distanciaKm == null && b.distanciaKm == null) return 0
        if (a.distanciaKm == null) return 1
        if (b.distanciaKm == null) return -1
        return a.distanciaKm - b.distanciaKm
      })
  }, [freelasRaw, onlineSet, estab?.localizacao, filtroFuncao, apenasOnline])

  // UI de cada freela
  function FreelaItem({ f }) {
    const foto = f.foto && typeof f.foto === 'string' ? f.foto : null
    const distanciaFmt = f.distanciaKm == null ? '—' : `${f.distanciaKm.toFixed(f.distanciaKm < 10 ? 1 : 0)} km`
    const statusPill = f.online ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'

    return (
      <div className="p-4 bg-white rounded-2xl shadow-md border border-orange-100 hover:shadow-lg transition">
        <div className="flex items-center gap-4">
          {foto ? (
            <img
              src={foto}
              alt={f.nome || 'Freela'}
              className="w-16 h-16 rounded-full object-cover border-2 border-orange-300"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <AvatarFallback className="w-16 h-16" />
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-orange-700">{f.nome || 'Freelancer'}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${statusPill}`}>
                {f.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {f.funcao || 'Função não informada'}
              {f.especialidade ? ` • ${f.especialidade}` : ''}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-700">
              <span className="px-2 py-1 rounded-md bg-orange-50 border border-orange-200">
                Distância: <strong>{distanciaFmt}</strong>
              </span>
              {typeof f.valorDiaria === 'number' && (
                <span className="px-2 py-1 rounded-md bg-orange-50 border border-orange-200">
                  Diária: <strong>R$ {f.valorDiaria.toFixed(2)}</strong>
                </span>
              )}
              {typeof f.avaliacaoMedia === 'number' && (
                <span className="px-2 py-1 rounded-md bg-yellow-50 border border-yellow-200">
                  ⭐ {f.avaliacaoMedia.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-white rounded-2xl border border-orange-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Filtrar por função/especialidade</label>
            <input
              type="text"
              value={filtroFuncao}
              onChange={(e) => setFiltroFuncao(e.target.value)}
              placeholder="ex: churrasqueiro, bartender, garçom..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <label className="inline-flex items-center gap-2 mt-1 sm:mt-7 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={apenasOnline}
              onChange={(e) => setApenasOnline(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Apenas online</span>
          </label>
        </div>
      </div>

      {carregando && (
        <div className="p-4 rounded-xl bg-white border border-orange-100 shadow-sm">Carregando freelas…</div>
      )}

      {!carregando && freelasDecorados.length === 0 && (
        <div className="p-4 rounded-xl bg-white border border-orange-100 shadow-sm text-gray-700">
          Nenhum freelancer {apenasOnline ? 'online' : ''} com esse filtro.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {freelasDecorados.map((f) => (
          <FreelaItem key={f.id} f={f} />
        ))}
      </div>
    </div>
  )
}
