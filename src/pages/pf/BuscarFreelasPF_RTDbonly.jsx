import React, { useEffect, useMemo, useState } from 'react'
import { getDatabase, ref as rtdbRef, onValue, off } from 'firebase/database'
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

function toKm(pf, fr) {
  const a = pf?.coordenadas || (pf?.localizacao && { latitude: pf.localizacao.latitude, longitude: pf.localizacao.longitude })
  const b = fr?.coordenadas || (fr?.localizacao && { latitude: fr.localizacao.latitude, longitude: fr.localizacao.longitude })
  if (!a?.latitude || !a?.longitude || !b?.latitude || !b?.longitude) return null
  const R = 6371, toRad = (x)=>x*Math.PI/180
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.latitude))*Math.cos(toRad(b.latitude))*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s))
}

function FreelaCard({ freela, distanciaKm, online, chamando, onChamar, observacao, setObservacao }) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow border hover:shadow-md">
      <div className="flex items-center gap-3">
        <img
          src={freela.foto || 'https://placehold.co/80x80'}
          alt={freela.nome || 'Freela'}
          className="w-16 h-16 rounded-full object-cover border"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{freela.nome || 'Freelancer'}</h3>
            <span className={`px-2 py-0.5 text-xs rounded-full ${online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{freela.funcao || 'Função não informada'}</p>
          {typeof freela.valorDiaria === 'number' && (
            <p className="text-sm text-gray-700">Diária: R$ {freela.valorDiaria.toFixed(2)}</p>
          )}
          {distanciaKm != null && (
            <p className="text-xs text-gray-500">Distância: {distanciaKm < 1 ? `${Math.round(distanciaKm*1000)} m` : `${distanciaKm.toFixed(1)} km`}</p>
          )}
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">📝 Observações</label>
        <textarea
          value={observacao[freela.id] || ''}
          onChange={(e)=>setObservacao(prev=>({ ...prev, [freela.id]: e.target.value }))}
          placeholder="Ex: Use roupa preta, falar com João..."
          className="w-full p-2 border rounded text-sm"
          rows={2}
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">⚠️ Não inclua telefone, e-mail ou redes sociais.</p>
      </div>

      <button
        onClick={()=>onChamar(freela)}
        disabled={chamando === freela.id || !online}
        className={`w-full mt-2 py-2 rounded-lg font-semibold text-white ${
          chamando === freela.id ? 'bg-orange-400' : online ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {chamando === freela.id ? 'Chamando...' : '📞 Chamar'}
      </button>
    </div>
  )
}

export default function BuscarFreelasPF_RTDbonly({ usuarioPF }) {
  const [statusMap, setStatusMap] = useState({})
  const [perfis, setPerfis] = useState({}) // {uid: perfil}
  const [filtro, setFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const [observacao, setObservacao] = useState({})

  // 1) Ouve quem está online no RTDB
  useEffect(() => {
    const dbR = getDatabase()
    const ref = rtdbRef(dbR, 'status')
    const handler = (snap) => {
      const val = snap.val() || {}
      setStatusMap(val)
    }
    onValue(ref, handler)
    return () => off(ref, 'value', handler)
  }, [])

  // 2) Busca perfis no Firestore apenas para UIDs online (tipo "freela")
  useEffect(() => {
    let cancel = false
    async function load() {
      setCarregando(true)
      try {
        const uidsOnline = Object.entries(statusMap)
          .filter(([, s]) => s?.online === true)
          .map(([uid]) => uid)

        // Busca perfis em paralelo
        const docs = await Promise.all(
          uidsOnline.map(async (uid) => {
            const snap = await getDoc(doc(db, 'usuarios', uid))
            if (!snap.exists()) return null
            const data = snap.data()
            if (data?.tipo !== 'freela') return null
            return { id: uid, ...data }
          })
        )
        if (!cancel) {
          // compacta
          const mapa = {}
          docs.filter(Boolean).forEach(d => { mapa[d.id] = d })
          setPerfis(mapa)
        }
      } finally {
        if (!cancel) setCarregando(false)
      }
    }
    load()
    return () => { cancel = true }
  }, [statusMap])

  // 3) Monta lista final (online + filtro + distância)
  const lista = useMemo(() => {
    const arr = Object.values(perfis).map((f) => {
      const online = statusMap[f.id]?.online === true
      const distanciaKm = toKm(usuarioPF, f)
      return { ...f, online, distanciaKm }
    })

    return arr
      .filter(f => f.online)
      .filter(f => !filtro || (f.funcao || '').toLowerCase().includes(filtro.toLowerCase()))
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity))
  }, [perfis, statusMap, filtro, usuarioPF])

  const chamarFreela = async (freela) => {
    if (!usuarioPF?.uid) return
    setChamando(freela.id)

    const obs = (observacao[freela.id] || '').trim()
    const contemContato = /(\d{4,}|\b(zap|whats|telefone|email|contato|instagram|arroba)\b)/i
    if (contemContato.test(obs)) {
      alert('🚫 Não inclua telefone, e-mail ou redes sociais nas instruções.')
      setChamando(null)
      return
    }

    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: freela.id,
        freelaNome: freela.nome || '',
        freelaFoto: freela.foto || '',
        freelaFuncao: freela.funcao || '',
        freela: { uid: freela.id, nome: freela.nome || '', foto: freela.foto || '', funcao: freela.funcao || '' },
        chamadorUid: usuarioPF.uid,
        chamadorNome: usuarioPF.nome || '',
        tipoChamador: 'pessoa_fisica',
        valorDiaria: freela.valorDiaria ?? null,
        observacao: obs,
        status: 'pendente',
        criadoEm: serverTimestamp(),
      })
      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`)
    } catch (e) {
      console.error('Erro ao chamar freela:', e)
      alert('Erro ao chamar freelancer.')
    }
    setChamando(null)
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-xl font-bold text-orange-700">Buscar Freelas (PF · RTDB)</h1>
        <input
          value={filtro}
          onChange={(e)=>setFiltro(e.target.value)}
          placeholder="Filtrar por função (ex.: churrasqueiro)"
          className="px-3 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-orange-400"
        />
      </header>

      {carregando ? (
        <div className="text-gray-600">Carregando freelancers online…</div>
      ) : lista.length === 0 ? (
        <div className="p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
          Nenhum freelancer online com essa função.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lista.map((freela) => (
            <FreelaCard
              key={freela.id}
              freela={freela}
              distanciaKm={freela.distanciaKm}
              online={freela.online}
              chamando={chamando}
              onChamar={chamarFreela}
              observacao={observacao}
              setObservacao={setObservacao}
            />
          ))}
        </div>
      )}
    </div>
  )
}
