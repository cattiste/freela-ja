import React, { useEffect, useMemo, useState } from 'react'
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { getDatabase, ref as rtdbRef, onValue, off } from 'firebase/database'
import { useAuth } from '@/context/AuthContext'

import ProfissionalCard from '@/components/ProfissionalCard'

// --- Util: distância Haversine (km)
function haversineKm(a, b) {
  if (!a || !b) return null
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371 // km
  const lat1 = a.latitude ?? a.lat ?? a._lat
  const lon1 = a.longitude ?? a.lng ?? a._long
  const lat2 = b.latitude ?? b.lat ?? b._lat
  const lon2 = b.longitude ?? b.lng ?? b._long
  if ([lat1, lon1, lat2, lon2].some((v) => typeof v !== 'number')) return null
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const s1 =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1))
  return R * c
}

function InitialsAvatar({ nome }) {
  const initials = (nome || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('') || '?'
  return (
    <div className="w-16 h-16 rounded-full bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-700 font-bold">
      {initials}
    </div>
  )
}

export default function BuscarFreelasPF() {
  const { usuario } = useAuth()
  const [pfDoc, setPfDoc] = useState(null)
  const [freelas, setFreelas] = useState([])
  const [statusMap, setStatusMap] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [filtroFuncao, setFiltroFuncao] = useState('')

  // 1) Carrega dados da pessoa física (para obter localizacao)
  useEffect(() => {
    if (!usuario?.uid) return
    const unsub = onSnapshot(doc(db, 'usuarios', usuario.uid), (snap) => {
      setPfDoc(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return () => unsub && unsub()
  }, [usuario?.uid])

  // 2) Ouve os freelas do Firestore
  useEffect(() => {
    setCarregando(true)
    const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
    const unsub = onSnapshot(q, (snap) => {
      const itens = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setFreelas(itens)
      setCarregando(false)
    }, (err) => {
      console.error('Erro buscando freelas:', err)
      setCarregando(false)
    })
    return () => unsub && unsub()
  }, [])

  // 3) Ouve o /status do RTDB (presença em tempo real)
  useEffect(() => {
    const dbR = getDatabase()
    const ref = rtdbRef(dbR, 'status')
    const handler = (snap) => setStatusMap(snap.val() || {})
    onValue(ref, handler)
    return () => off(ref, 'value', handler)
  }, [])

  // 4) Merge + filtros + ordenação
  const lista = useMemo(() => {
    const base = freelas
      // filtro por função: tenta campo 'funcao' (string) ou 'funcoes' (array)
      .filter(f => {
        if (!filtroFuncao?.trim()) return true
        const alvo = filtroFuncao.trim().toLowerCase()
        const f1 = (f.funcao || '').toLowerCase()
        const f2 = Array.isArray(f.funcoes) ? f.funcoes.map(x => String(x).toLowerCase()) : []
        return f1.includes(alvo) || f2.some(x => x.includes(alvo))
      })
      .map(f => {
        const s = statusMap[f.id] || statusMap[f.uid] || {} // garante por id ou uid
        const online = !!s.online
        const ultimaAtividade = s.ultimaAtividade || null
        const distanciaKm = pfDoc?.localizacao && f.localizacao
          ? haversineKm(pfDoc.localizacao, f.localizacao)
          : null
        return { ...f, online, ultimaAtividade, distanciaKm }
      })

    // Ordena: online primeiro; depois menor distância; depois por nome
    return base.sort((a, b) => {
      if (a.online !== b.online) return a.online ? -1 : 1
      const da = a.distanciaKm ?? Number.POSITIVE_INFINITY
      const db = b.distanciaKm ?? Number.POSITIVE_INFINITY
      if (da !== db) return da - db
      return (a.nome || '').localeCompare(b.nome || '')
    })
  }, [freelas, statusMap, pfDoc, filtroFuncao])

  const total = freelas.length
  const onlines = lista.filter(f => f.online).length

  return (
    <div className="p-4 space-y-4">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-bold text-orange-700">Buscar Freelas (Pessoa Física)</h1>
        <div className="flex items-center gap-2">
          <input
            value={filtroFuncao}
            onChange={(e) => setFiltroFuncao(e.target.value)}
            placeholder="Filtrar por função (ex.: churrasqueiro, garçom)"
            className="px-3 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-orange-400"
          />
          <span className="text-sm text-gray-600">
            {onlines}/{total} online
          </span>
        </div>
      </header>

      {carregando && (
        <div className="text-gray-600">Carregando freelas…</div>
      )}

      {!carregando && lista.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
          Nenhum freelancer {filtroFuncao ? `para "${filtroFuncao}" ` : ''}no momento.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {lista.map((freela) => (
          // Se já tiver um ProfissionalCard pronto, substitua este bloco pelo componente:
          // <ProfissionalCard key={freela.id} freela={freela} distanceKm={freela.distanciaKm} online={freela.online} />
          <div
            key={freela.id}
            className={`p-4 rounded-2xl border shadow-sm hover:shadow-md transition ${
              freela.online ? 'border-green-300 bg-white' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {freela.foto ? (
                <img
                  src={freela.foto}
                  alt={freela.nome || 'Freela'}
                  className="w-16 h-16 rounded-full object-cover border"
                />
              ) : (
                <InitialsAvatar nome={freela.nome} />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{freela.nome || 'Freelancer'}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      freela.online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {freela.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {freela.funcao || (Array.isArray(freela.funcoes) ? freela.funcoes.join(', ') : 'Função não informada')}
                </p>
                {typeof freela.valorDiaria === 'number' && (
                  <p className="text-sm text-gray-700">Diária: R$ {freela.valorDiaria.toFixed(2)}</p>
                )}
                {freela.distanciaKm != null && (
                  <p className="text-xs text-gray-500">
                    Distância: {freela.distanciaKm < 1 ? `${Math.round(freela.distanciaKm * 1000)} m` : `${freela.distanciaKm.toFixed(1)} km`}
                  </p>
                )}
              </div>
            </div>

            {freela.especialidade && (
              <div className="mt-3 text-sm text-gray-700">
                <strong>Especialidade:</strong> {freela.especialidade}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}