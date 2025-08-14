import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, onSnapshot, doc, getDoc, getDocs, setDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import ProfissionalCard from '@/components/ProfissionalCard'

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
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// --- normaliza vários formatos de localização para {lat, lon}
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

// formata timestamp para ID customizado
function formatarId(estabelecimentoUid) {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const id = `${estabelecimentoUid}_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  return id
}

const ACTIVE_STATUSES = ['pendente', 'aceita', 'checkin_freela', 'em_andamento', 'checkout_freela']

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
  const [chamandoUid, setChamandoUid] = useState(null)
  const [freelasComChamadaAtiva, setFreelasComChamadaAtiva] = useState(() => new Set()) // freelas com chamada ativa

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

  // 2) Escutar freelas (coleção usuarios) — busca todos e filtra por tipo no client
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

  // 3b) Escutar chamadas ativas do ESTABELECIMENTO: marca quais freelas já têm chamada ativa
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

  // 4) Montar lista com distância e status online (com normalização de localização)
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
        // filtro por função (se preenchido)
        const ff = (filtroFuncao || '').trim().toLowerCase()
        const okFuncao = ff
          ? (String(f.funcao || '').toLowerCase().includes(ff) ||
             String(f.especialidade || '').toLowerCase().includes(ff))
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
  }, [freelasRaw, onlineSet, estab?.localizacao, filtroFuncao, apenasOnline, freelasComChamadaAtiva])

  // 5) Criar chamada (bloqueia se já existir ativa para este freela)
  async function chamarFreela(freela) {
    if (!usuario?.uid) return alert('Você precisa estar autenticado como estabelecimento.')
    try {
      setChamandoUid(freela.id)

      // 5a) Checagem rápida pelo Set em memória
      if (freelasComChamadaAtiva.has(freela.id)) {
        alert('Já existe uma chamada ativa com este freela.')
        return
      }

      // 5b) Checagem de segurança na base (evita corrida)
      const qCheck = query(
        collection(db, 'chamadas'),
        where('estabelecimentoUid', '==', usuario.uid),
        where('freelaUid', '==', freela.id),
        where('status', 'in', ACTIVE_STATUSES)
      )
      const existing = await getDocs(qCheck)
      if (!existing.empty) {
        alert('Já existe uma chamada ativa com este freela.')
        return
      }

      const id = formatarId(usuario.uid)
      const chamada = {
        // chaves
        idPersonalizado: id,
        estabelecimentoUid: usuario.uid,
        estabelecimentoNome: usuario.nome || '',
        freelaUid: freela.id,
        freelaNome: freela.nome || '',
        // valores
        valorDiaria: typeof freela.valorDiaria === 'number' ? freela.valorDiaria : 0,
        // localização (se quiser usar depois)
        estabelecimentoLocalizacao: estab?.localizacao || null,
        freelaLocalizacao: freela?.localizacao || null,
        // status/controle
        status: 'pendente',
        criadoEm: serverTimestamp(),
      }

      await setDoc(doc(db, 'chamadas', id), chamada)
      alert(`Chamada enviada para ${freela.nome || 'freela'}.`)

    } catch (err) {
      console.error('[BuscarFreelas] Erro ao chamar freela:', err)
      alert('Erro ao chamar o freela. Veja o console.')
    } finally {
      setChamandoUid(null)
    }
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
        {freelasDecorados.map((f) => {
          if (!f?.id || !f?.nome) return null // segurança extra
          return (
            <ProfissionalCard
              key={f.id}
              freela={f}
              online={f.online}
              distanciaKm={f.distanciaKm}
              hasChamadaAtiva={f.hasChamadaAtiva}
              onChamar={() => chamarFreela(f)}
              chamandoUid={chamandoUid}
              AvatarFallback={AvatarFallback}
           />
         )
       })}
      </div>
    </div>
  )
}
