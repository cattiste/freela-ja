import React, { useState, useEffect } from 'react'
import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('buscar')
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCarregando(true)
        setErro(null)

        if (!user) {
          setEstabelecimento(null)
          setErro('Nenhum usuário logado. Faça login para continuar.')
          return
        }

        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          setErro('Perfil de estabelecimento não encontrado. Verifique se você completou seu cadastro.')
          return
        }

        const data = docSnap.data()

        if (data.tipo !== 'estabelecimento') {
          setErro('Acesso restrito a estabelecimentos. Você está cadastrado como: ' + data.tipo)
          return
        }

        setEstabelecimento({
          uid: user.uid,
          ...data,
          nome: data.nome || 'Estabelecimento não nomeado',
          email: user.email
        })
      } catch (err) {
        console.error('Erro ao carregar estabelecimento:', err)
        setErro('Ocorreu um erro ao carregar seus dados. Tente novamente mais tarde.')
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const renderConteudo = () => {
    switch (aba) {
      case 'buscar':
        return <BuscarFreelas estabelecimento={estabelecimento} />
      case 'chamadas':
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'agendas':
        return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacaoFreela estabelecimento={estabelecimento} />
      default:
        return <BuscarFreelas estabelecimento={estabelecimento} />
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-600">
        <div className="text-center">
          <p className="text-xl font-semibold">Carregando seus dados...</p>
          <p className="text-sm text-gray-500">Por favor, aguarde.</p>
        </div>
      </div>
    )
  }

  if (erro || !estabelecimento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md bg-red-50 p-6 rounded-lg border border-red-100">
          <h2 className="text-xl font-bold text-red-600 mb-2">Acesso não autorizado</h2>
          <p className="text-red-700 mb-4">{erro}</p>
          <button
            onClick={() => auth.signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sair e tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold text-orange-700">
              📊 Painel do {estabelecimento.nome || 'Estabelecimento'}
            </h1>
            <div className="text-sm text-gray-500">
              Logado como: {estabelecimento.email}
            </div>
          </div>
          <button
            onClick={() => navigate('/editarperfilestabelecimento')}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            ⚙️ Editar Perfil
          </button>
        </div>

        <div className="flex gap-4 mb-6 border-b pb-2 overflow-x-auto">
          <button
            onClick={() => setAba('buscar')}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${aba === 'buscar' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            🔍 Buscar Freelancers
          </button>
          <button
            onClick={() => setAba('chamadas')}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${aba === 'chamadas' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            📞 Chamadas
          </button>
          <button
            onClick={() => setAba('agendas')}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${aba === 'agendas' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            📅 Agendas
          </button>
          <button
            onClick={() => setAba('avaliacao')}
            className={`px-4 py-2 rounded-md whitespace-nowrap ${aba === 'avaliacao' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            ⭐ Avaliar
          </button>
        </div>

        {renderConteudo()}
      </div>
    </div>
  )
}
