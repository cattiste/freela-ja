import React, { useEffect, useState, useMemo } from 'react'
import {
  collection, query, where, onSnapshot, addDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'

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

function FreelaCard({ freela, distanciaKm, onChamar, chamando }) {
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
            {Array.isArray(freela.especialidades)
              ? freela.especialidades.join(', ')
              : freela.especialidades}
          </p>
        )}
        {freela.valorDiaria && (
          <p className="text-sm font-semibold text-orange-700 mt-1">
            💰 R$ {freela.valorDiaria} / diária
          </p>
        )}
        {distanciaKm != null && (
          <p className="text-sm text-gray-600 mt-1">
            📍 Aprox. {distanciaKm.toFixed(1)} km do local
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-700">🟢 Online agora</span>
        </div>
      </div>

      <button
        onClick={() => onChamar(freela)}
        disabled={chamando === freela.id}
        className="w-full py-2 px-4 rounded-lg font-semibold transition bg-orange-500 hover:bg-orange-600 text-white"
      >
        {chamando === freela.id ? 'Chamando...' : '📞 Chamar'}
      </button>
    </div>
  )
}

export default function BuscarFreelas({ estabelecimento, usuariosOnline = {} }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const [filtroFuncao, setFiltroFuncao] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id // ✅ garante compatibilidade exata com Realtime DB
        }
      })
      setFreelas(todos)
      setCarregando(false)
    })
    return () => unsubscribe()
  }, [])

  const chamarFreela = async (freela) => {
    if (!estabelecimento?.uid) return
    setChamando(freela.id)

    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: freela.id,
        freelaNome: freela.nome,
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome,
        vagaTitulo: 'Serviço direto',
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

  const freelasFiltrados = useMemo(() => {
    return freelas
      .filter((f) => {
        const status = usuariosOnline[f.id]
        const online = status?.online === true
        const funcaoMatch =
          !filtroFuncao || f.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())

        console.log(`🕵️ ${f.nome} [${f.id}] → Online: ${online} | Função: ${f.funcao}`)

        return online && funcaoMatch
      })
      .map((f) => {
        const distanciaKm =
          f.coordenadas && estabelecimento?.coordenadas
            ? calcularDistancia(
                estabelecimento.coordenadas.latitude,
                estabelecimento.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null

        return { ...f, distanciaKm }
      })
      .sort((a, b) => (a.distanciaKm || Infinity) - (b.distanciaKm || Infinity))
  }, [freelas, usuariosOnline, filtroFuncao, estabelecimento])

  return (
    <div className="min-h-screen bg-cover bg-center p-4 pb-20"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="max-w-6xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {carregando ? (
        <p className="text-center text-white">Carregando freelancers...</p>
      ) : freelasFiltrados.length === 0 ? (
        <p className="text-center text-white">Nenhum freelancer online com essa função.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {freelasFiltrados.map((freela) => (
            <FreelaCard
              key={freela.id}
              freela={freela}
              distanciaKm={freela.distanciaKm}
              onChamar={chamarFreela}
              chamando={chamando}
            />
          ))}
        </div>
      )}
    </div>
  )
}
