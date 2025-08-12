import React, { useEffect, useState, useMemo } from 'react'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function normalizarCoord(obj) {
  if (obj?.coordenadas?.latitude != null && obj?.coordenadas?.longitude != null) return obj.coordenadas
  if (obj?.localizacao?.latitude != null && obj?.localizacao?.longitude != null)
    return { latitude: obj.localizacao.latitude, longitude: obj.localizacao.longitude }
  return null
}

function FreelaCard({ freela, distanciaKm, onChamar, chamando, observacao, setObservacao, online }) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition">
      <div className="flex flex-col items-center mb-3">
        <img
          src={freela.foto || 'https://via.placeholder.com/80'}
          alt={freela.nome}
          className="w-20 h-20 rounded-full object-cover border-2 border-orange-400"
        />
        <h3 className="mt-2 text-lg font-bold text-orange-700 text-center">{freela.nome}</h3>
        <p className="text-sm text-gray-600 text-center">{freela.funcao}</p>
        {freela.especialidades && (
          <p className="text-sm text-gray-500 text-center">
            {Array.isArray(freela.especialidades) ? freela.especialidades.join(', ') : freela.especialidades}
          </p>
        )}
        {freela.valorDiaria && (
          <p className="text-sm font-semibold text-orange-700 mt-1">💰 R$ {freela.valorDiaria} / diária</p>
        )}
        {distanciaKm != null && (
          <p className="text-sm text-gray-600 mt-1">📍 Aprox. {distanciaKm.toFixed(1)} km do local</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className={`text-xs ${online ? 'text-green-700' : 'text-gray-600'}`}>
            {online ? '🟢 Online agora' : '⚪ Offline'}
          </span>
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">📝 Observações para o freela</label>
        <textarea
          value={observacao[freela.id] || ''}
          onChange={(e) => setObservacao((prev) => ({ ...prev, [freela.id]: e.target.value }))}
          placeholder="Ex: Use roupa preta, falar com gerente João..."
          className="w-full p-2 border rounded text-sm"
          rows={2}
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">⚠️ Não inclua telefone, e-mail ou redes sociais.</p>
      </div>

      <button
        onClick={() => onChamar(freela)}
        disabled={chamando === freela.id || !online}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition text-white ${
          chamando === freela.id ? 'bg-orange-400'
          : online ? 'bg-orange-500 hover:bg-orange-600'
          : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {chamando === freela.id ? 'Chamando...' : '📞 Chamar'}
      </button>
    </div>
  )
}

// 👉 Este componente espera receber `usuariosOnline` já pronto (mapa { uid: {online:true} })
export default function BuscarFreelasPF({ usuario, usuariosOnline = {} }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [observacao, setObservacao] = useState({})

  useEffect(() => {
    // 🔎 Agora busca somente quem é freela pelo novo modelo
    const q = query(
      collection(db, 'usuarios'),
      where('tipoConta', '==', 'funcional'),
      where('tipoUsuario', '==', 'freela')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      setFreelas(todos)
      setCarregando(false)
    })
    return () => unsubscribe()
  }, [])

  const temPresenca = useMemo(
    () => Object.keys(usuariosOnline || {}).length > 0,
    [usuariosOnline]
  )

  const chamarFreela = async (freela) => {
    if (!usuario?.uid) return
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

        // 🔑 PF chamando
        chamadorUid: usuario.uid,
        chamadorTipo: 'pessoa_fisica',
        pessoaFisicaUid: usuario.uid, // ESSENCIAL p/ leitura nas regras

        valorDiaria: freela.valorDiaria ?? null,
        observacao: obs,
        status: 'pendente',
        criadoEm: serverTimestamp()
      })
      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      alert('Erro ao chamar freelancer.')
    }

    setChamando(null)
  }

  const lista = useMemo(() => {
    const origem = normalizarCoord(usuario)
    return freelas
      .map((f) => {
        const status = usuariosOnline[f.id]
        const online = temPresenca ? status?.online === true : true
        const coordsF = normalizarCoord(f)
        const distanciaKm =
          origem && coordsF ? calcularDistancia(origem.latitude, origem.longitude, coordsF.latitude, coordsF.longitude) : null
        return { ...f, online, distanciaKm }
      })
      .filter((f) => (temPresenca ? f.online : true))
      .filter((f) => !filtroFuncao || (f.funcao || '').toLowerCase().includes(filtroFuncao.toLowerCase()))
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity))
  }, [freelas, usuariosOnline, temPresenca, filtroFuncao, usuario])

  return (
    <div className="p-4 pb-24">
      <div className="max-w-6xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {!temPresenca && (
        <div className="max-w-6xl mx-auto mb-3 text-xs text-gray-500">
          ⏳ Carregando status online… mostrando todos temporariamente.
        </div>
      )}

      {carregando ? (
        <p className="text-center text-gray-700">Carregando freelancers...</p>
      ) : lista.length === 0 ? (
        <p className="text-center text-gray-700">Nenhum freelancer online com essa função.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {lista.map((freela) => (
            <FreelaCard
              key={freela.id}
              freela={freela}
              distanciaKm={freela.distanciaKm}
              online={freela.online}
              onChamar={chamarFreela}
              chamando={chamando}
              observacao={observacao}
              setObservacao={setObservacao}
            />
          ))}
        </div>
      )}
    </div>
  )
}
