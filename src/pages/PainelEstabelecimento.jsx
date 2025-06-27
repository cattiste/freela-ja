import React, { useState, useEffect } from 'react'
import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { getDoc, doc } from 'firebase/firestore'

// Importe com caminho relativo correto
import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('buscar')
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setEstabelecimento(null)
          return
        }

        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists() || docSnap.data()?.tipo !== 'estabelecimento') {
          setErro('Acesso restrito a estabelecimentos.')
          return
        }

        setEstabelecimento({ 
          uid: user.uid, 
          ...docSnap.data() 
        })
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
        setErro('Falha ao carregar dados.')
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const renderConteudo = () => {
    if (!estabelecimento) return null
    
    const componentes = {
      buscar: <BuscarFreelas estabelecimento={estabelecimento} />,
      chamadas: <ChamadasEstabelecimento estabelecimento={estabelecimento} />,
      agendas: <AgendasContratadas estabelecimento={estabelecimento} />,
      avaliacao: <AvaliacaoFreela estabelecimento={estabelecimento} />,
    }

    return componentes[aba] || componentes.buscar
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-600">
        Carregando dados do estabelecimento...
      </div>
    )
  }

  if (!estabelecimento) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 text-center">
        <p>{erro || 'Você precisa estar logado como estabelecimento para acessar o painel.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">📊 Painel do Estabelecimento</h1>

        <div className="flex gap-4 mb-6 border-b pb-2">
          <button 
            onClick={() => setAba('buscar')} 
            className={`px-4 py-2 rounded-lg ${aba === 'buscar' ? 'bg-orange-600 text-white' : 'bg-gray-100'}`}
          >
            🔍 Buscar Freelancers
          </button>
          <button 
            onClick={() => setAba('chamadas')} 
            className={`px-4 py-2 rounded-lg ${aba === 'chamadas' ? 'bg-orange-600 text-white' : 'bg-gray-100'}`}
          >
            📞 Chamadas
          </button>
          <button 
            onClick={() => setAba('agendas')} 
            className={`px-4 py-2 rounded-lg ${aba === 'agendas' ? 'bg-orange-600 text-white' : 'bg-gray-100'}`}
          >
            📅 Agendas
          </button>
          <button 
            onClick={() => setAba('avaliacao')} 
            className={`px-4 py-2 rounded-lg ${aba === 'avaliacao' ? 'bg-orange-600 text-white' : 'bg-gray-100'}`}
          >
            ⭐ Avaliar
          </button>
        </div>

        {erro && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {erro}
          </div>
        )}
        
        {renderConteudo()}
      </div>
    </div>
  )
}