import React, { useEffect, useMemo, useState } from 'react'
import { getDatabase, ref, onValue, off } from 'firebase/database'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

function distKm(a, b) {
  if (!a || !b) return null
  const toRad = (x)=>x*Math.PI/180, R = 6371
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.latitude))*Math.cos(toRad(b.latitude))*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s))
}

export default function BuscarFreelasPF_IndexRTDB({ usuarioPF }) {
  const [mapa, setMapa] = useState({})
  const [filtro, setFiltro] = useState('')
  const [chamando, setChamando] = useState(null)
  const [observacao, setObservacao] = useState({})

  // Ouve índice público
  useEffect(() => {
    const dbR = getDatabase()
    const idxRef = ref(dbR, 'public/onlineFreelas')
    const handler = (snap) => setMapa(snap.val() || {})
    onValue(idxRef, handler)
    return () => off(idxRef, 'value', handler)
  }, [])

  const origem = usuarioPF?.coordenadas
    || (usuarioPF?.localizacao && { latitude: usuarioPF.localizacao.latitude, longitude: usuarioPF.localizacao.longitude })

  const lista = useMemo(() => {
    const arr = Object.values(mapa || {})
      .filter(f => f.online === true)
      .map(f => {
        const distanciaKm = (origem && f.coordenadas?.latitude != null && f.coordenadas?.longitude != null)
          ? distKm(origem, f.coordenadas) : null
        return { ...f, distanciaKm }
      })
      .filter(f => !filtro || (f.funcao || '').toLowerCase().includes(filtro.toLowerCase()))
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity))
    return arr
  }, [mapa, filtro, origem])

  const chamar = async (freela) => {
    if (!usuarioPF?.uid) return
    setChamando(freela.uid)
    const obs = (observacao[freela.uid] || '').trim()
    const proib = /(\d{4,}|\b(zap|whats|telefone|email|contato|instagram|arroba)\b)/i
    if (proib.test(obs)) {
      alert('🚫 Não inclua telefone, e-mail ou redes sociais.')
      setChamando(null)
      return
    }
    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: freela.uid,
        freelaNome: freela.nome || '',
        freelaFoto: freela.foto || '',
        freelaFuncao: freela.funcao || '',
        freela: { uid: freela.uid, nome: freela.nome || '', foto: freela.foto || '', funcao: freela.funcao || '' },
        chamadorUid: usuarioPF.uid,
        chamadorNome: usuarioPF.nome || '',
        tipoChamador: 'pessoa_fisica',
        valorDiaria: freela.valorDiaria ?? null,
        observacao: obs,
        status: 'pendente',
        criadoEm: serverTimestamp()
      })
      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`)
    } catch (e) {
      console.error(e)
      alert('Erro ao chamar freelancer.')
    }
    setChamando(null)
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <h1 className="text-xl font-bold text-orange-700">Buscar Freelas (PF · Índice RTDB)</h1>
        <input
          value={filtro}
          onChange={(e)=>setFiltro(e.target.value)}
          placeholder="Filtrar por função (ex.: churrasqueiro)"
          className="px-3 py-2 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-orange-400"
        />
      </header>

      {lista.length === 0 ? (
        <div className="p-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800">
          Nenhum freelancer online com essa função.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lista.map((f) => (
            <div key={f.uid} className="p-4 bg-white rounded-2xl shadow border hover:shadow-md">
              <div className="flex items-center gap-3">
                <img src={f.foto || 'https://placehold.co/80x80'} alt={f.nome || 'Freela'} className="w-16 h-16 rounded-full object-cover border" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{f.nome || 'Freelancer'}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Online</span>
                  </div>
                  <p className="text-sm text-gray-600">{f.funcao || 'Função não informada'}</p>
                  {typeof f.valorDiaria === 'number' && (
                    <p className="text-sm text-gray-700">Diária: R$ {f.valorDiaria.toFixed(2)}</p>
                  )}
                  {f.distanciaKm != null && (
                    <p className="text-xs text-gray-500">
                      Distância: {f.distanciaKm < 1 ? `${Math.round(f.distanciaKm*1000)} m` : `${f.distanciaKm.toFixed(1)} km`}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">📝 Observações</label>
                <textarea
                  value={observacao[f.uid] || ''}
                  onChange={(e)=>setObservacao(prev=>({ ...prev, [f.uid]: e.target.value }))}
                  placeholder="Ex: Use roupa preta, falar com João..."
                  className="w-full p-2 border rounded text-sm"
                  rows={2}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">⚠️ Não inclua telefone, e-mail ou redes sociais.</p>
              </div>

              <button
                onClick={()=>chamar(f)}
                disabled={chamando === f.uid}
                className={`w-full mt-2 py-2 rounded-lg font-semibold text-white ${
                  chamando === f.uid ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {chamando === f.uid ? 'Chamando...' : '📞 Chamar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
