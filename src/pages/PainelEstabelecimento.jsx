import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'
import PublicarVaga from './PublicarVaga'
import MinhasVagas from './MinhasVagas'

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('minhas-vagas')
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [vagaEditando, setVagaEditando] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
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

  function abrirEdicao(vaga) {
    setVagaEditando(vaga)
    setAba('publicar')
  }

  function onSalvarSucesso() {
    setVagaEditando(null)
    setAba('minhas-vagas')
  }

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
        return (
          <PublicarVaga
            estabelecimento={estabelecimento}
            vaga={vagaEditando}
            onSucesso={onSalvarSucesso}
          />
        )
      case 'minhas-vagas':
        return <MinhasVagas estabelecimento={estabelecimento} onEditar={abrirEdicao} />
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

        {/* Botões das abas */}
        <div className="flex flex-wrap gap-4 mb-6 border-b pb-4">
          {[
            { label: '🔍 Buscar Freelancers', key: 'buscar' },
            { label: '📞 Chamadas', key: 'chamadas' },
            { label: '📅 Agendas', key: 'agendas' },
            { label: '⭐ Avaliar', key: 'avaliacao' },
            { label: '📢 Publicar Vaga', key: 'publicar' },
            { label: '📋 Minhas Vagas', key: 'minhas-vagas' },
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => {
                setVagaEditando(null)
                setAba(btn.key)
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                aba === btn.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba selecionada */}
        <div>{renderConteudo()}</div>
      </div>
    </div>
  )
}
