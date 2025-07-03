import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

import AgendaFreela from './freelas/AgendaFreela'
import HistoricoTrabalhosFreela from './freelas/HistoricoTrabalhosFreela'
import AvaliacoesRecebidasFreela from './freelas/AvaliacoesRecebidasFreela'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [aba, setAba] = useState('agenda') // aba inicial

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists() && snap.data().tipo === 'freela') {
          setUsuario({ uid: user.uid, ...snap.data() })
        } else {
          setUsuario(null)
        }
      } else {
        setUsuario(null)
      }
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem('usuarioLogado')
      navigate('/login')
    } catch (err) {
      alert('Erro ao sair.')
    }
  }

  const renderConteudo = () => {
    switch (aba) {
      case 'agenda':
        return <AgendaFreela freela={usuario} />
      case 'historico':
        return <HistoricoTrabalhosFreela freela={usuario} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freela={usuario} />
      default:
        return <AgendaFreela freela={usuario} />
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">Carregando painel...</p>
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">Acesso não autorizado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-700">👤 Painel do Freelancer</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(`/editarfreela/${usuario.uid}`)}
              className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              ✏️ Editar Perfil
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              🔒 Logout
            </button>
          </div>
        </div>

        {/* Navegação por abas */}
        <nav className="border-b border-orange-300 mb-6">
          <ul className="flex space-x-2">
            {[
              { key: 'agenda', label: '🗓️ Agenda' },
              { key: 'historico', label: '🧾 Histórico de Trabalhos' },
              { key: 'avaliacoes', label: '⭐ Avaliações Recebidas' }
            ].map(({ key, label }) => (
              <li key={key} className="list-none">
                <button
                  onClick={() => setAba(key)}
                  className={`px-4 py-2 -mb-px border-b-2 font-semibold transition ${
                    aba === key
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-orange-400 hover:text-orange-600 hover:border-orange-400'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Conteúdo da aba */}
        <section>{renderConteudo()}</section>
      </div>
    </div>
  )
}
