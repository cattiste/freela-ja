import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore'
import { db } from '@/firebase'
import AgendaFreela from '../components/AgendaFreela'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [vagas, setVagas] = useState([])
  const [chamadas, setChamadas] = useState([])
  const [audioChamada] = useState(() =>
    new Audio(
      'https://res.cloudinary.com/dbemvuau3/video/upload/v1750961914/qhkd3ojkqhi2imr9lup8.mp3'
    )
  )

  // Pré-carrega o som
  useEffect(() => {
    audioChamada.load()
  }, [audioChamada])

  const tocarSomChamada = useCallback(() => {
    audioChamada.play().catch(() => console.log('🔇 Áudio bloqueado'))
  }, [audioChamada])

  // Carrega freelancer e configura listeners
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

      // Listener de chamadas para este freela
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

      // Listener para vagas ativas
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

    // Cleanup no unmount
    return () => {
      unsubscribeVagas()
    }
  }, [carregarFreela])

  // Aceitar chamada
  const aceitarChamada = async (chamada) => {
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'aceita' })
      setChamadas((prev) =>
        prev.map((c) => (c.id === chamada.id ? { ...c, status: 'aceita' } : c))
      )
    } catch (err) {
      alert('Erro ao aceitar chamada.')
      console.error(err)
    }
  }

  // Recusar chamada
  const recusarChamada = async (chamada) => {
    try {
      await updateDoc(doc(db, 'chamadas', chamada.id), { status: 'recusada' })
      setChamadas((prev) =>
        prev.map((c) => (c.id === chamada.id ? { ...c, status: 'recusada' } : c))
      )
    } catch (err) {
      alert('Erro ao recusar chamada.')
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

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          🎯 Painel do Freelancer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Perfil */}
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
              </div>
            </div>

            <button
              onClick={() => navigate(`/editarfreela/${freela.uid}`)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
            >
              ✏️ Editar Perfil
            </button>
          </div>

          {/* Agenda */}
          <div className="bg-white rounded-2xl shadow p-6">
            <AgendaFreela uid={freela.uid} />
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
                  <a
                    href={`mailto:${
                      vaga.emailContato || ''
                    }?subject=Candidatura para vaga: ${encodeURIComponent(
                      vaga.titulo
                    )}`}
                    className="mt-4 inline-block px-5 py-2 bg-blue-600 text-white font-semibold rounded-full cursor-pointer transition-colors duration-300 no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ✅ Candidatar-se
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chamadas */}
        <div className="mt-10 bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">📞 Chamadas Recentes</h2>
          {chamadas.length === 0 ? (
            <p className="text-gray-500">Nenhuma chamada recebida ainda.</p>
          ) : (
            chamadas.map((chamada) => (
              <div key={chamada.id} className="mb-4 border-b pb-3">
                <p><strong>Estabelecimento:</strong> {chamada.estabelecimentoNome}</p>
                <p><strong>Data:</strong> {chamada.criadoEm?.toDate?.().toLocaleString() || '—'}</p>
                <p><strong>Status:</strong> {chamada.status || 'pendente'
