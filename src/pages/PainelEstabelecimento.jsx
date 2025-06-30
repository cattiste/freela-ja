import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

import { auth, db } from '@/firebase'
import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'
import PublicarVaga from './PublicarVaga'
import MinhasVagas from './MinhasVagas'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const [aba, setAba] = useState('buscar') // 👉 Começa na aba "Buscar Freelancers"
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
            setEstabelecimento(null)
          }
        } catch (err) {
          console.error('Erro ao buscar dados do estabelecimento:', err)
          setEstabelecimento(null)
        }
      } else {
        setEstabelecimento(null)
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

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('usuarioLogado')
      navigate('/login')
    } catch (err) {
      alert('Erro ao sair.')
      console.error(err)
    }
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
      default:
        return <MinhasVagas estabelecimento={estabelecimento} onEditar={abrirEdicao} />
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-700">📊 Painel do Estabelecimento</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            🔒 Logout
          </button>
        </div>

        {/* Botões das abas */}
        <div className="flex flex-wrap gap-4 mb-6 border-b pb-4">
          {[
            { key: 'buscar', label: '🔍 Buscar Freelancers' },
            { key: 'chamadas', label: '📞 Chamadas' },
            { key: 'agendas', label: '📅 Agendas' },
            { key: 'avaliacao', label: '⭐ Avaliar' },
            { key: 'publicar', label: '📢 Publicar Vaga' },
            { key: 'minhas-vagas', label: '📋 Minhas Vagas' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => {
                setVagaEditando(null)
                setAba(item.key)
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                aba === item.key
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => navigate('/editarperfilestabelecimento')}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            ✏️ Editar Perfil
          </button>
        </div>

        {/* Conteúdo da aba atual */}
        <div>{renderConteudo()}</div>
      </div>
    </div>
  )
}
