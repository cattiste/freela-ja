import React, { useState, useEffect } from 'react'
import { auth, db } from '../../firebase'
import { onAuthStateChanged, getDoc, doc } from 'firebase/auth'

import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('buscar')
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Buscar dados do estabelecimento no Firestore
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.tipo === 'estabelecimento') {
            setEstabelecimento({ uid: user.uid, ...data })
          } else {
            alert('Você precisa estar logado como estabelecimento.')
            // Aqui você pode redirecionar ou logout
          }
        } else {
          alert('Dados do estabelecimento não encontrados.')
        }
      } else {
        setEstabelecimento(null)
        // Redirecionar para login talvez
      }
      setCarregando(false)
    })
    return () => unsubscribe()
  }, [])

  const renderConteudo = () => {
    switch (aba) {
      case 'buscar': return <BuscarFreelas estabelecimento={estabelecimento} />
      case 'chamadas': return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'agendas': return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'avaliacao': return <AvaliacaoFreela estabelecimento={estabelecimento} />
      default: return <BuscarFreelas estabelecimento={estabelecimento} />
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        <p>Você precisa estar logado como estabelecimento para acessar o painel.</p>
        {/* Botão ou link para redirecionar para login */}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">📊 Painel do Estabelecimento</h1>

        {/* Navegação por abas */}
        <div className="flex gap-4 mb-6 border-b pb-2">
          <button onClick={() => setAba('buscar')} className={`btn-secondary ${aba === 'buscar' && 'bg-orange-600 text-white'}`}>🔍 Buscar Freelancers</button>
          <button onClick={() => setAba('chamadas')} className={`btn-secondary ${aba === 'chamadas' && 'bg-orange-600 text-white'}`}>📞 Chamadas</button>
          <button onClick={() => setAba('agendas')} className={`btn-secondary ${aba === 'agendas' && 'bg-orange-600 text-white'}`}>📅 Agendas</button>
          <button onClick={() => setAba('avaliacao')} className={`btn-secondary ${aba === 'avaliacao' && 'bg-orange-600 text-white'}`}>⭐ Avaliar</button>
        </div>

        {/* Conteúdo da aba */}
        {renderConteudo()}
      </div>
    </div>
  )
}
