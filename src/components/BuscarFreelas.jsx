import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, onSnapshot, doc, getDoc, getDocs, setDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import ProfissionalCardMini from '@/components/ProfissionalCardMini'
import ModalFreelaDetalhes from '@/components/ModalFreelaDetalhes'
import { useRealtimePresence } from '@/hooks/useRealtimePresence'
import criaChamada from '@/utils/criarChamada'
import { toast } from 'react-hot-toast'

const handleChamar = async (freela) => {
  try {
    await criaChamada({
      freela,
      contratante: usuario,
      localizacao: usuario.localizacao,
      observacao: 'Comparecer de roupa preta', // opcional
    })
    toast.success('Chamada realizada com sucesso!')
  } catch (err) {
    console.error('[BuscarFreelas] erro ao chamar freela:', err)
    toast.error('Erro ao chamar freela.')
  }
}

const ACTIVE_STATUSES = ['pendente', 'aceita', 'checkin_freela', 'em_andamento', 'checkout_freela']

function calcularDistancia(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' || typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' || typeof lon2 !== 'number'
  ) return null
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

function normalizeLocation(loc) {
  if (!loc) return null
  if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
    return { lat: loc.latitude, lon: loc.longitude }
  }
  if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
    return { lat: loc.lat, lon: loc.lng }
  }
  if (typeof loc.lat === 'number' && typeof loc.lon === 'number') {
    return { lat: loc.lat, lon: loc.lon }
  }
  if (typeof loc.lat === 'number' && typeof loc.long === 'number') {
    return { lat: loc.lat, lon: loc.long }
  }
  if (typeof loc.latitude === 'number' && typeof loc.long === 'number') {
    return { lat: loc.latitude, lon: loc.long }
  }
  return null
}

function formatarId(estabelecimentoUid) {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${estabelecimentoUid}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export default function BuscarFreelas({ usuario: usuarioProp }) {
  const { usuario: usuarioCtx } = useAuth()
  const usuario = usuarioProp || usuarioCtx

  useRealtimePresence(usuario)

  const [estab, setEstab] = useState(null)
  const [freelasRaw, setFreelasRaw] = useState([])
  const [onlineSet, setOnlineSet] = useState(new Set())
  const [apenasOnline, setApenasOnline] = useState(false)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [freelasComChamadaAtiva, setFreelasComChamadaAtiva] = useState(new Set())
  const [freelaSelecionado, setFreelaSelecionado] = useState(null)

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

  useEffect(() => {
    setCarregando(true)
    const qUsuarios = collection(db, 'usuarios')
    const unsub = onSnapshot(qUsuarios, (snap) => {
      const todos = []
      snap.forEach((d) => todos.push({ id: d.id, ...d.data() }))
      const freelas = todos.filter((u) => {
        const role = (u?.tipo || u?.tipoUsuario || '').toLowerCase().trim()
        return role === 'freela' || role === 'freelancer'
      })
      setFreelasRaw(freelas)
      setCarregando(false)
    }, (err) => {
      console.error('[BuscarFreelas] onSnapshot usuarios erro:', err)
      setCarregando(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const qStatusOnline = query(collection(db, 'status'), where('state', '==', 'online'))
    const unsub = onSnapshot(qStatusOnline, (snap) => {
      const setNovo = new Set()
      snap.forEach((d) => setNovo.add(d.id))
      setOnlineSet(setNovo)
    }, (err) => {
      console.error('[BuscarFreelas] onSnapshot status erro:', err)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!usuario?.uid) return
    const qChamadasAtivas = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', usuario.uid),
      where('status', 'in', ACTIVE_STATUSES)
    )
    const unsub = onSnapshot(qChamadasAtivas, (snap) => {
      const setIds = new Set()
      snap.forEach((d) => {
        const data = d.data()
        if (data?.freelaUid) setIds.add(data.freelaUid)
      })
      setFreelasComChamadaAtiva(setIds)
    }, (err) => {
      console.warn('[BuscarFreelas] onSnapshot chamadas ativas erro:', err)
    })
    return () => unsub()
  }, [usuario?.uid])

  const freelasDecorados = useMemo(() => {
    const E = normalizeLocation(estab?.localizacao)

    return freelasRaw
      .map((f) => {
        const F = normalizeLocation(f?.localizacao)
        const distanciaKm = (E && F)
          ? calcularDistancia(E.lat, E.lon, F.lat, F.lon)
          : null

        const online = onlineSet.has(f.id)
        const hasChamadaAtiva = freelasComChamadaAtiva.has(f.id)

        return { ...f, online, distanciaKm, hasChamadaAtiva }
      })
      .filter((f) => {
        const ff = (filtroFuncao || '').trim().toLowerCase()
        const okFuncao = ff
          ? (String(f.funcao || '').toLowerCase().includes(ff) ||
             String(f.especialidade || '').toLowerCase().includes(ff))
          : true

        const okOnline = apenasOnline ? Boolean(f.online) === true : true

        return okFuncao && okOnline
      })
      .sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1
        if (a.distanciaKm == null && b.distanciaKm == null) return 0
        if (a.distanciaKm == null) return 1
        if (b.distanciaKm == null) return -1
        return a.distanciaKm - b.distanciaKm
      })
  }, [freelasRaw, onlineSet, estab?.localizacao, filtroFuncao, apenasOnline, freelasComChamadaAtiva])

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
          <ProfissionalCardMini
            key={f.id}
            freela={f}
            onClick={() => setFreelaSelecionado(f)}
          />
        ))}
      </div>

      <ModalFreelaDetalhes
        freela={freelaSelecionado}
        onClose={() => setFreelaSelecionado(null)}
      />
    </div>
  )
}
