import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

function FreelaCard({ freela, onChamar, chamando }) {
  const { online, ultimaAtividade } = useOnlineStatus(freela.id)

  const ultimaHora = ultimaAtividade
    ? ultimaAtividade.toDate().toLocaleTimeString('pt-BR')
    : '...'

  return (
    <div className="p-3 bg-white rounded-xl shadow border border-orange-100 hover:shadow-md transition text-center">
      <h3 className="text-sm font-bold text-orange-700">{freela.nome}</h3>
      <p className="text-xs text-gray-600">{freela.funcao}</p>
      <div className="flex justify-center items-center gap-2 mt-1 text-xs">
        <span className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className={`${online ? 'text-green-700' : 'text-gray-500'}`}>
          {online ? '🟢 Online' : `🔴 ${ultimaHora}`}
        </span>
      </div>
      <button
        onClick={() => onChamar(freela)}
        disabled={!online || chamando === freela.id}
        className={`mt-2 text-xs px-3 py-1 rounded-lg font-semibold transition ${
          online
            ? 'bg-orange-500 hover:bg-orange-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {chamando === freela.id ? 'Chamando...' : 'Chamar'}
      </button>
    </div>
  )
}

export default function BuscarFreelas({ estabelecimento }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const [chamadosIds, setChamadosIds] = useState([])
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

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'checkout_freela'])
    )

    const unsub = onSnapshot(q, (snap) => {
      const ativos = snap.docs.map(doc => doc.data().freelaUid)
      setChamadosIds(ativos)
    })

    return () => unsub()
  }, [estabelecimento])

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

  const filtrarFreelas = (freela) => {
    const funcaoOK = filtroFuncao === '' || freela.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
    const esp = Array.isArray(freela.especialidades)
      ? freela.especialidades.join(', ')
      : (freela.especialidades || '')
    const espOK = filtroEspecialidade === '' || esp.toLowerCase().includes(filtroEspecialidade.toLowerCase())
    const naoChamado = !chamadosIds.includes(freela.id)
    return funcaoOK && espOK && naoChamado
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
        {freelas.filter(filtrarFreelas).map(freela => (
          <FreelaCard
            key={freela.id}
            freela={freela}
            onChamar={chamarFreela}
            chamando={chamando}
          />
        ))}
      </div>
    </div>
  )
}