import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'

// Importa seus componentes já existentes
import AgendaFreela from './freelas/AgendaFreela'
import HistoricoTrabalhosFreela from './freelas/HistoricoTrabalhosFreela'
import AvaliacoesRecebidasFreela from './freelas/AvaliacoesRecebidasFreela'

// Componentes placeholder para chat e configurações
function ChatFreela() {
  return <div>🗨️ Chat ainda em desenvolvimento...</div>
}

function ConfiguracoesFreela() {
  return <div>⚙️ Configurações do Freelancer ainda em desenvolvimento...</div>
}

export default function PainelFreela() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [aba, setAba] = useState('agenda')
  const [carregando, setCarregando] = useState(true)
  const [chamadas, setChamadas] = useState([])
  const [loadingCheckin, setLoadingCheckin] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async user => {
      if (user) {
        const docRef = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(docRef)
        if (snap.exists() && snap.data().tipo === 'freela') {
          setUsuario({ uid: user.uid, ...snap.data() })

          // Inscreve nas chamadas em tempo real para esse freela
          const chamadasRef = collection(db, 'chamadas')
          const q = query(chamadasRef, where('freelaUid', '==', user.uid))
          const unsubscribeChamadas = onSnapshot(q, snapshot => {
            setChamadas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
          })

          // Limpa inscrição quando desloga ou muda usuário
          return () => unsubscribeChamadas()
        } else {
          setUsuario(null)
        }
      } else {
        setUsuario(null)
      }
      setCarregando(false)
    })

    return () => unsubscribeAuth()
  }, [])

  const fazerCheckin = async () => {
    const chamada = chamadas.find(c => !c.checkInFreela && c.status === 'aceita')
    if (!chamada) return alert('Nenhuma chamada pendente para check-in.')
    setLoadingCheckin(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkInFreela: true,
        checkInHora: serverTimestamp()
      })
      alert('Check-in realizado!')
    } catch {
      alert('Erro ao fazer check-in.')
    }
    setLoadingCheckin(false)
  }

  const fazerCheckout = async () => {
    const chamada = chamadas.find(c => c.checkInFreela && !c.checkOutFreela && c.status === 'aceita')
    if (!chamada) return alert('Nenhuma chamada pendente para check-out.')
    setLoadingCheckout(true)
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), {
        checkOutFreela: true,
        checkOutHora: serverTimestamp()
      })
      alert('Check-out realizado!')
    } catch {
      alert('Erro ao fazer check-out.')
    }
    setLoadingCheckout(false)
  }

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
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

  const renderConteudo = () => {
    switch (aba) {
      case 'agenda':
        return <AgendaFreela freela={usuario} />
      case 'historico':
        return <HistoricoTrabalhosFreela freelaUid={usuario.uid} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={usuario.uid} />
      case 'chamadas':
        return (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Chamadas Ativas</h2>
            {chamadas.length === 0 && <p>Nenhuma chamada ativa.</p>}
            {chamadas.map(chamada => (
              <div key={chamada.id} className="border rounded p-3 mb-4">
                <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
                <p><strong>Status:</strong> {chamada.status}</p>
                <p><strong>Check-in feito:</strong> {chamada.checkInFreela ? 'Sim' : 'Não'}</p>
                <p><strong>Check-out feito:</strong> {chamada.checkOutFreela ? 'Sim' : 'Não'}</p>
                {chamada.status === 'pendente' && (
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={async () => await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'aceita' })}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      ✅ Aceitar
                    </button>
                    <button
                      onClick={async () => await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'recusada' })}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      ❌ Recusar
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Botões de checkin e checkout */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={fazerCheckin}
                disabled={loadingCheckin}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                {loadingCheckin ? 'Registrando...' : 'Check-in'}
              </button>
              <button
                onClick={fazerCheckout}
                disabled={loadingCheckout}
                className="bg-yellow-600 text-white px-6 py-2 rounded"
              >
                {loadingCheckout ? 'Registrando...' : 'Check-out'}
              </button>
            </div>
          </div>
        )
      case 'chat':
        return <ChatFreela />
      case 'configuracoes':
        return <ConfiguracoesFreela />
      default:
        return <AgendaFreela freela={usuario} />
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-orange-700">🧑‍🍳 Painel do Freelancer</h1>
            <p className="text-gray-600 mt-1">{usuario.nome} — {usuario.funcao}</p>
          </div>
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
          <ul className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'agenda', label: '📆 Minha Agenda' },
              { key: 'chamadas', label: '📞 Chamadas' },
              { key: 'chat', label: '💬 Chat' },
              { key: 'avaliacoes', label: '⭐ Avaliações' },
              { key: 'historico', label: '📜 Histórico' },
              { key: 'configuracoes', label: '⚙️ Configurações' }
            ].map(({ key, label }) => (
              <li key={key} className="list-none">
                <button
                  onClick={() => setAba(key)}
                  className={`px-4 py-2 -mb-px border-b-2 font-semibold transition whitespace-nowrap ${
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

        {/* Conteúdo da aba selecionada */}
        <section>{renderConteudo()}</section>
      </div>
    </div>
  )
}
