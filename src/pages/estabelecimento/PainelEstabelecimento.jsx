// Exemplo simplificado do PainelEstabelecimento.jsx

import React, { useState, useEffect } from 'react'
import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'
import { auth, db } from '../../firebase' // Seu firebase e auth configurados
import { onAuthStateChanged, doc, getDoc } from 'firebase/auth' // ou firestore

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('buscar')
  const [estabelecimento, setEstabelecimento] = useState(null)

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
            // Se for outro tipo, desloga ou limpa
            setEstabelecimento(null)
          }
        } else {
          setEstabelecimento(null)
        }
      } else {
        setEstabelecimento(null)
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

  if (!estabelecimento) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-600">
        Você precisa estar logado como estabelecimento para acessar este painel.
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
            className={`btn-secondary ${aba === 'buscar' && 'bg-orange-600 text-white'}`}
          >
            🔍 Buscar Freelancers
          </button>
          <button
            onClick={() => setAba('chamadas')}
            className={`btn-secondary ${aba === 'chamadas' && 'bg-orange-600 text-white'}`}
          >
            📞 Chamadas
          </button>
          <button
            onClick={() => setAba('agendas')}
            className={`btn-secondary ${aba === 'agendas' && 'bg-orange-600 text-white'}`}
          >
            📅 Agendas
          </button>
          <button
            onClick={() => setAba('avaliacao')}
            className={`btn-secondary ${aba === 'avaliacao' && 'bg-orange-600 text-white'}`}
          >
            ⭐ Avaliar
          </button>
        </div>

        {renderConteudo()}
      </div>
    </div>
  )
}
