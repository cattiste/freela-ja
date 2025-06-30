import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useNavigate } from 'react-router-dom'

import BuscarFreelas from './BuscarFreelas'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'
import PublicarVaga from './PublicarVaga'
import MinhasVagas from './MinhasVagas'

// COMPONENTE CHAMADAS ESTABELECIMENTO
function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const chamadasRef = collection(db, 'chamadas')
    const q = query(chamadasRef, where('estabelecimentoUid', '==', estabelecimento.uid))

    setCarregando(true)
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const listaChamadas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setChamadas(listaChamadas)
        setCarregando(false)
      },
      err => {
        console.error('Erro ao carregar chamadas:', err)
        setCarregando(false)
      }
    )

    return () => unsubscribe()
  }, [estabelecimento])

  async function confirmarCheckIn(chamada) {
    if (!chamada.checkInFreela) {
      alert('O freelancer ainda não fez check-in.')
      return
    }
    if (chamada.checkInConfirmado) {
      alert('Check-in já confirmado.')
      return
    }
    try {
      const chamadaRef = doc(db, 'chamadas', chamada.id)
      await updateDoc(chamadaRef, {
        checkInConfirmado: true,
        checkInConfirmadoHora: new Date()
      })
      alert('Check-in confirmado com sucesso!')
    } catch (err) {
      console.error('Erro ao confirmar check-in:', err)
      alert('Erro ao confirmar check-in.')
    }
  }

  async function confirmarCheckOut(chamada) {
    if (!chamada.checkOutFreela) {
      alert('O freelancer ainda não fez check-out.')
      return
    }
    if (chamada.checkOutConfirmado) {
      alert('Check-out já confirmado.')
      return
    }
    try {
      const chamadaRef = doc(db, 'chamadas', chamada.id)
      await updateDoc(chamadaRef, {
        checkOutConfirmado: true,
        checkOutConfirmadoHora: new Date()
      })
      alert('Check-out confirmado com sucesso!')
    } catch (err) {
      console.error('Erro ao confirmar check-out:', err)
      alert('Erro ao confirmar check-out.')
    }
  }

  function statusColor(status) {
    switch (status) {
      case 'aceita':
        return 'text-green-600 font-semibold'
      case 'recusada':
        return 'text-red-600 font-semibold'
      case 'pendente':
      default:
        return 'text-yellow-600 font-semibold'
    }
  }

  const formatDate = timestamp => {
    try {
      if (!timestamp) return '—'
      if (timestamp.toDate) return timestamp.toDate().toLocaleString()
      if (timestamp instanceof Date) return timestamp.toLocaleString()
      if (typeof timestamp === 'number') return new Date(timestamp).toLocaleString()
      return String(timestamp)
    } catch {
      return '—'
    }
  }

  if (carregando) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando chamadas...
      </div>
    )
  }

  if (chamadas.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Você ainda não fez nenhuma chamada para freelancers.
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-700 mb-4 text-center">
        📞 Minhas Chamadas
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-orange-300 rounded-lg shadow-sm">
          <thead className="bg-orange-100">
            <tr>
              <th className="border border-orange-300 px-4 py-2 text-left">Freelancer</th>
              <th className="border border-orange-300 px-4 py-2 text-left">Data da Chamada</th>
              <th className="border border-orange-300 px-4 py-2 text-left">Status</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Check-in Freela</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Check-in Confirmado</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Confirmar Check-in</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Check-out Freela</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Check-out Confirmado</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Confirmar Check-out</th>
            </tr>
          </thead>
          <tbody>
            {chamadas.map(chamada => (
              <tr key={chamada.id} className="hover:bg-orange-50">
                <td className="border border-orange-300 px-4 py-2">{chamada.freelaNome}</td>
                <td className="border border-orange-300 px-4 py-2">{formatDate(chamada.criadoEm)}</td>
                <td className={`border border-orange-300 px-4 py-2 ${statusColor(chamada.status || 'pendente')}`}>
                  {chamada.status ? chamada.status.charAt(0).toUpperCase() + chamada.status.slice(1) : 'Pendente'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {chamada.checkInFreela ? '✔️' : '❌'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {chamada.checkInConfirmado ? '✔️' : '❌'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  <button
                    disabled={chamada.checkInConfirmado || !chamada.checkInFreela}
                    onClick={() => confirmarCheckIn(chamada)}
                    className={`px-3 py-1 rounded text-white ${
                      chamada.checkInConfirmado || !chamada.checkInFreela
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    Confirmar
                  </button>
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {chamada.checkOutFreela ? '✔️' : '❌'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {chamada.checkOutConfirmado ? '✔️' : '❌'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  <button
                    disabled={chamada.checkOutConfirmado || !chamada.checkOutFreela}
                    onClick={() => confirmarCheckOut(chamada)}
                    className={`px-3 py-1 rounded text-white ${
                      chamada.checkOutConfirmado || !chamada.checkOutFreela
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    }`}
                  >
                    Confirmar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
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

  // Função logout
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
          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('buscar')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'buscar'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            🔍 Buscar Freelancers
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('chamadas')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'chamadas'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📞 Chamadas
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('agendas')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'agendas'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📅 Agendas
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('avaliacao')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'avaliacao'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            ⭐ Avaliar
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('publicar')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'publicar'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📢 Publicar Vaga
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('minhas-vagas')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'minhas-vagas'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📋 Minhas Vagas
          </button>

          {/* Botão para editar perfil */}
          <button
            onClick={() => navigate('/editar-perfil-estabelecimento')} // ajuste a rota conforme seu projeto
            className="px-4 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            ✏️ Editar Perfil
          </button>
        </div>

        {/* Conteúdo da aba */}
        <div>{renderConteudo()}</div>
      </div>
    </div>
  )
}
