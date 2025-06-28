import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { signOut } from 'firebase/auth'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [vagas, setVagas] = useState([])
  const [chamadas, setChamadas] = useState([])
  const [loadingCheckin, setLoadingCheckin] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  // Carregar áudio da chamada
  const [audioChamada] = useState(() =>
    new Audio(
      'https://res.cloudinary.com/dbemvuau3/video/upload/v1750961914/qhkd3ojkqhi2imr9lup8.mp3'
    )
  )
  useEffect(() => {
    audioChamada.load()
  }, [audioChamada])

  const tocarSomChamada = useCallback(() => {
    audioChamada.play().catch(() => console.log('🔇 Áudio bloqueado'))
  }, [audioChamada])

  // Carregar dados do freela e chamadas em tempo real
  const carregarFreela = useCallback(async () => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    try {
      const ref = doc(db, 'usuarios', usuario.uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        alert('Freelancer não encontrado.')
        navigate('/login')
        return
      }

      const dados = snap.data()
      setFreela({ uid: usuario.uid, ...dados })

      const chamadasRef = collection(db, 'chamadas')
      const q = query(chamadasRef, where('freelaUid', '==', usuario.uid))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const chamada = { id: change.doc.id, ...change.doc.data() }
            alert(`📩 Você foi chamado por ${chamada.estabelecimentoNome}!`)
            tocarSomChamada()
            setChamadas((prev) => [chamada, ...prev])
          }
          if (change.type === 'modified') {
            const chamadaAtualizada = { id: change.doc.id, ...change.doc.data() }
            setChamadas((prev) =>
              prev.map((c) => (c.id === chamadaAtualizada.id ? chamadaAtualizada : c))
            )
          }
          if (change.type === 'removed') {
            setChamadas((prev) => prev.filter((c) => c.id !== change.doc.id))
          }
        })
      })

      return unsubscribe
    } catch (err) {
      console.error('Erro ao carregar freela:', err)
      navigate('/login')
    }
  }, [navigate, tocarSomChamada])

  useEffect(() => {
    let unsubscribeVagas = () => {}

    const iniciar = async () => {
      const unsubscribeChamadas = await carregarFreela()

      const vagasRef = collection(db, 'vagas')
      const q = query(vagasRef, where('status', '==', 'ativo'))

      unsubscribeVagas = onSnapshot(q, (snapshot) => {
        const vagasLista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        setVagas(vagasLista)
      })

      return () => {
        unsubscribeChamadas && unsubscribeChamadas()
        unsubscribeVagas()
      }
    }
    iniciar()

    return () => {
      unsubscribeVagas()
    }
  }, [carregarFreela])

  // Função para registrar check-in do freela na chamada pendente mais recente
  const fazerCheckin = async () => {
    if (!freela) return

    // Busca a chamada pendente para check-in (checkInFreela false)
    const chamadaPendente = chamadas.find((c) => !c.checkInFreela && c.status === 'aceita')
    if (!chamadaPendente) {
      alert('Nenhuma chamada pendente para check-in.')
      return
    }

    setLoadingCheckin(true)
    try {
      const chamadaRef = doc(db, 'chamadas', chamadaPendente.id)
      await updateDoc(chamadaRef, {
        checkInFreela: true,
        checkInHora: serverTimestamp()
      })
      alert('Check-in realizado! Agora aguarde a confirmação do estabelecimento.')
    } catch (err) {
      alert('Erro ao fazer check-in.')
      console.error(err)
    }
    setLoadingCheckin(false)
  }

  // Função para registrar check-out do freela na chamada pendente para checkout
  const fazerCheckout = async () => {
    if (!freela) return

    // Busca a chamada que teve check-in feito e está pendente de checkout (checkOutFreela false)
    const chamadaPendenteCheckout = chamadas.find(
      (c) => c.checkInFreela === true && !c.checkOutFreela && c.status === 'aceita'
    )
    if (!chamadaPendenteCheckout) {
      alert('Nenhuma chamada pendente para check-out.')
      return
    }

    setLoadingCheckout(true)
    try {
      const chamadaRef = doc(db, 'chamadas', chamadaPendenteCheckout.id)
      await updateDoc(chamadaRef, {
        checkOutFreela: true,
        checkOutHora: serverTimestamp()
      })
      alert('Check-out realizado! Agora aguarde a confirmação do estabelecimento.')
    } catch (err) {
      alert('Erro ao fazer check-out.')
      console.error(err)
    }
    setLoadingCheckout(false)
  }

  // Logout
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

  if (!freela) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Carregando...
      </div>
    )
  }

  // Helper para formatar timestamp para string legível
  const formatTimestamp = (timestamp) => {
    try {
      return timestamp?.toDate?.().toLocaleString() || '—'
    } catch {
      return '—'
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-800">🎯 Painel do Freelancer</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            🔒 Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil e checkin/checkout */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center gap-6">
              <img
                src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                alt="Foto"
                className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow"
              />
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{freela.nome}</h2>
                <p className="text-blue-600">{freela.funcao}</p>
                <p className="text-gray-600">{freela.email}</p>
                <p className="text-gray-600">📱 {freela.celular}</p>
                <p className="text-gray-600">📍 {freela.endereco}</p>
                <p className="text-green-700 mt-1 font-semibold">
                  💰 Diária: R$ {freela.valorDiaria || '—'}
                </p>

                <div className="mt-4">
                  <p><strong>Último Check-in na chamada:</strong> {formatTimestamp(freela.checkIn)}</p>
                  <p><strong>Último Check-out na chamada:</strong> {formatTimestamp(freela.checkOut)}</p>
                </div>

                <div className="flex gap-4 mt-3">
                  <button
                    onClick={fazerCheckin}
                    disabled={loadingCheckin}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    {loadingCheckin ? 'Registrando...' : 'Fazer Check-in'}
                  </button>
                  <button
                    onClick={fazerCheckout}
                    disabled={loadingCheckout}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    {loadingCheckout ? 'Registrando...' : 'Fazer Check-out'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de chamadas com status */}
          <div className="bg-white rounded-2xl shadow p-6 max-h-[500px] overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Chamadas Ativas</h2>
            {chamadas.length === 0 && <p>Nenhuma chamada ativa no momento.</p>}
            {chamadas.map((chamada) => (
              <div key={chamada.id} className="mb-4 p-3 border rounded">
                <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
                <p><strong>Status da Chamada:</strong> {chamada.status}</p>
                <p>
                  <strong>Check-in feito por você:</strong> {chamada.checkInFreela ? 'Sim' : 'Não'}
                </p>
                <p>
                  <strong>Check-in confirmado pelo estabelecimento:</strong>{' '}
                  {chamada.checkInConfirmadoHora ? formatTimestamp(chamada.checkInConfirmadoHora) : 'Não'}
                </p>
                <p>
                  <strong>Check-out feito por você:</strong> {chamada.checkOutFreela ? 'Sim' : 'Não'}
                </p>
                <p>
                  <strong>Check-out confirmado pelo estabelecimento:</strong>{' '}
                  {chamada.checkOutConfirmado ? 'Sim' : 'Não'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Vagas */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">📌 Vagas Disponíveis</h2>
          {vagas.length === 0 ? (
            <p className="text-gray-600">🔎 Nenhuma vaga disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vagas.map((vaga) => (
                <div
                  key={vaga.id}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(`/vaga/${vaga.id}`)}
                >
                  <h3 className="text-lg font-bold text-gray-800">{vaga.titulo}</h3>
                  <p><strong>🏢</strong> {vaga.empresa || 'Não informada'}</p>
                  <p><strong>📍</strong> {vaga.cidade || 'Não informada'}</p>
                  <p>
                    <strong>💰</strong>{' '}
                    {vaga.valorDiaria
                      ? `R$ ${vaga.valorDiaria.toFixed(2)}`
                      : vaga.salario || '—'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{vaga.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
