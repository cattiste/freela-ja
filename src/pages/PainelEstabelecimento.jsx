import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

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
        try {
          const docRef = doc(db, 'usuarios', user.uid)
          const snap = await getDoc(docRef)

          if (snap.exists() && snap.data().tipo === 'estabelecimento') {
            setEstabelecimento({ uid: user.uid, ...snap.data() })
          } else {
            console.warn('Usuário autenticado não é um estabelecimento.')
          }
        } catch (err) {
          console.error('Erro ao buscar dados do estabelecimento:', err)
        }
      } else {
        console.warn('Nenhum usuário autenticado.')
      }
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  const renderConteudo = () => {
    try {
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
    } catch (err) {
      console.error('Erro ao renderizar a aba:', err)
      return <p className="text-red-600">Erro ao carregar conteúdo da aba.</p>
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">Carregando painel...</p>
      </div>
    )
  }

  if (!estabelecimento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">Acesso não autorizado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-3xl font-bold text-orange-700 mb-4">📊 Painel do Estabelecimento</h1>

        <div className="flex gap-4 mb-6 border-b pb-2">
          <button onClick={() => setAba('buscar')} className={`btn-secondary ${aba === 'buscar' && 'bg-orange-600 text-white'}`}>🔍 Buscar Freelancers</button>
          <button onClick={() => setAba('chamadas')} className={`btn-secondary ${aba === 'chamadas' && 'bg-orange-600 text-white'}`}>📞 Chamadas</button>
          <button onClick={() => setAba('agendas')} className={`btn-secondary ${aba === 'agendas' && 'bg-orange-600 text-white'}`}>📅 Agendas</button>
          <button onClick={() => setAba('avaliacao')} className={`btn-secondary ${aba === 'avaliacao' && 'bg-orange-600 text-white'}`}>⭐ Avaliar</button>
        </div>

        {renderConteudo()}
      </div>
    </div>
  )
}
