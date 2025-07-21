import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import ChamadaInline from './ChamadaInline'

function FreelaCard({ freela, onChamar, chamando, chamadaAtiva }) {
  const { online } = useOnlineStatus(freela.id)

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
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className={`text-xs ${online ? 'text-green-700' : 'text-gray-500'}`}>
            {online ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <button
        onClick={() => onChamar(freela)}
        disabled={!online || chamando === freela.id}
        className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
          online
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {chamando === freela.id ? 'Chamando...' : '📞 Chamar'}
      </button>

      {chamadaAtiva && <ChamadaInline chamada={chamadaAtiva} />}
    </div>
  )
}

export default function BuscarFreelas({ estabelecimento }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const [chamadasAtivas, setChamadasAtivas] = useState({})
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setFreelas(lista)
      setCarregando(false)
    }, (error) => {
      console.error('Erro ao buscar freelancers:', error)
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  const chamarFreela = async (freela) => {
    if (!estabelecimento?.uid) return
    setChamando(freela.id)

    try {
      const chamadaRef = await addDoc(collection(db, 'chamadas'), {
        freelaUid: freela.id,
        freelaNome: freela.nome,
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome,
        vagaTitulo: 'Serviço direto',
        status: 'pendente',
        criadoEm: serverTimestamp()
      })

      const docSnap = await getDoc(doc(db, 'chamadas', chamadaRef.id))
      setChamadasAtivas(prev => ({
        ...prev,
        [freela.id]: { id: chamadaRef.id, ...docSnap.data() }
      }))

      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      alert('Erro ao chamar freelancer.')
    }

    setChamando(null)
  }

  const filtrarFreelas = (freela) => {
    const funcaoOK = filtroFuncao === '' || freela.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
    const espOK = filtroEspecialidade === '' || freela.especialidades?.toLowerCase().includes(filtroEspecialidade.toLowerCase())
    return funcaoOK && espOK
  }

  if (carregando) return <p>Carregando freelancers...</p>
  if (freelas.length === 0) return <p>Nenhum freelancer encontrado.</p>

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
      {/* 🔎 Filtros */}
      <div className="max-w-6xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="🔍 Buscar por função (ex: Cozinheiro)"
          className="p-3 rounded-xl border border-orange-300 focus:ring-2 focus:ring-orange-500 outline-none"
          value={filtroFuncao}
          onChange={e => setFiltroFuncao(e.target.value)}
        />
        <input
          type="text"
          placeholder="🎯 Filtrar por especialidade (ex: Feijoada, Drinks)"
          className="p-3 rounded-xl border border-orange-300 focus:ring-2 focus:ring-orange-500 outline-none"
          value={filtroEspecialidade}
          onChange={e => setFiltroEspecialidade(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {freelas.filter(filtrarFreelas).map(freela => (
          <FreelaCard
            key={freela.id}
            freela={freela}
            onChamar={chamarFreela}
            chamando={chamando}
            chamadaAtiva={chamadasAtivas[freela.id]}
          />
        ))}
      </div>
    </div>
  )
}
