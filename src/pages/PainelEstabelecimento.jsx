import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'
import PublicarVaga from './PublicarVaga'

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
    switch (aba) {
      case 'buscar':
        return <BuscarFreelas estabelecimento={estabelecimento} />
      case 'chamadas':
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'agendas':
        return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacaoFreela estabelecimento={estabelecimento} />
      case 'publicar':
        return <PublicarVaga estabelecimento={estabelecimento} />
      default:
        return <BuscarFreelas estabelecimento={estabelecimento} />
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
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-orange-700 mb-6">📊 Painel do Estabelecimento</h1>

        {/* Botões de abas */}
        <div className="flex flex-wrap gap-4 mb-6 border-b pb-4">
          <button
            onClick={() => setAba('buscar')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'buscar'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            🔍 Buscar Freelancers
          </button>

          <button
            onClick={() => setAba('chamadas')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'chamadas'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📞 Chamadas
          </button>

          <button
            onClick={() => setAba('agendas')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'agendas'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📅 Agendas
          </button>

          <button
            onClick={() => setAba('avaliacao')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'avaliacao'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            ⭐ Avaliar
          </button>

          <button
            onClick={() => setAba('publicar')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'publicar'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📢 Publicar Vaga
          </button>
        </div>

        {/* Conteúdo da aba selecionada */}
        <div>{renderConteudo()}</div>
      </div>
    </div>
  )
}
