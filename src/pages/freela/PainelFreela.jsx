import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, query, where, onSnapshot, doc,
  getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { signOut } from 'firebase/auth'

import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import AgendaCompleta from '@/pages/freela/AgendaCompleta'
import ChamadasFreela from '@/pages/freela/ChamadasFreela'
import RecebimentosFreela from '@/pages/freela/RecebimentosFreela'
import ConfiguracoesFreela from '@/pages/freela/ConfiguracoesFreela'
import { useRealtimePresence } from '@/hooks/useRealtimePresence'
import { getDatabase, ref, set, onDisconnect } from 'firebase/database'

function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return
    const db = getDatabase()
    const userStatusRef = ref(db, 'users/' + uid)

    onDisconnect(userStatusRef).update({
      online: false,
      lastSeen: Date.now()
    })

    set(userStatusRef, {
      online: true,
      lastSeen: Date.now()
    })
  }, [uid])
}

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [vagas, setVagas] = useState([])
  const [chamadas, setChamadas] = useState([])
  const [abaSelecionada, setAbaSelecionada] = useState('painel')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    const carregarDados = async () => {
      try {
        const refUsuario = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(refUsuario)
        if (!snap.exists()) {
          alert('Freelancer não encontrado.')
          navigate('/login')
          return
        }

        const dados = snap.data()
        setFreela({ uid: usuario.uid, ...dados })
        await updateDoc(refUsuario, { ultimaAtividade: serverTimestamp() })

        // Presença só após confirmação do UID
        usePresence(usuario.uid)
        useRealtimePresence(usuario.uid)

        // Chamadas
        const chamadasRef = collection(db, 'chamadas')
        const qChamadas = query(chamadasRef, where('freelaUid', '==', usuario.uid))
        const unsubChamadas = onSnapshot(qChamadas, snapshot => {
          const chamadasAtuais = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setChamadas(chamadasAtuais)
        })

        // Vagas
        const vagasRef = collection(db, 'vagas')
        const qVagas = query(vagasRef, where('status', '==', 'ativo'))
        const unsubVagas = onSnapshot(qVagas, snapshot => {
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setVagas(lista)
        })

        setCarregando(false)
        return () => {
          unsubChamadas()
          unsubVagas()
        }

      } catch (err) {
        console.error('Erro ao carregar freela:', err)
        navigate('/login')
      }
    }

    carregarDados()
  }, [navigate])

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  if (carregando || !freela) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Carregando painel...</div>
  }

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'agenda':
        return (
          <div className="max-w-7xl mx-auto p-4">
            <AgendaCompleta freela={freela} />
          </div>
        )
      case 'chamadas':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <ChamadasFreela freela={freela} />
          </div>
        )
      case 'recebimentos':
        return (
          <div className="max-w-4xl mx-auto p-4">
            <RecebimentosFreela freela={freela} />
          </div>
        )
      case 'config':
        return (
          <div className="max-w-3xl mx-auto p-4">
            <ConfiguracoesFreela freela={freela} />
          </div>
        )
      case 'painel':
      default:
        return (
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between mb-6">
              <h1 className="text-3xl font-bold text-blue-800">🎯 Painel do Freelancer</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center gap-6">
                  <img
                    src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                    className="w-24 h-24 rounded-full object-cover border-2 border-blue-400 shadow"
                    alt="Foto do freelancer"
                  />
                  <div>
                    <h2 className="text-2xl font-semibold">{freela.nome}</h2>
                    <p className="text-blue-600">{freela.funcao}</p>
                    <p className="text-gray-600">{freela.email}</p>
                    <p className="text-gray-600">📱 {freela.celular}</p>
                    <p className="text-gray-600">📍 {freela.endereco}</p>
                    <p className="text-green-700 font-semibold">💰 Diária: R$ {freela.valorDiaria || '—'}</p>
                    <p className="text-sm text-gray-500 mt-1">📝 Tipo: {freela.tipoContrato || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-blue-700 mb-4">📌 Vagas Disponíveis</h2>
              {vagas.length === 0 ? (
                <p className="text-gray-600">🔎 Nenhuma vaga no momento.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vagas.map(vaga => (
                    <div
                      key={vaga.id}
                      onClick={() => navigate(`/vaga/${vaga.id}`)}
                      className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
                    >
                      <h3 className="font-bold text-lg">{vaga.titulo}</h3>
                      <p>🏢 {vaga.empresa || '—'}</p>
                      <p>📍 {vaga.cidade || '—'}</p>
                      <p>💰 {vaga.valorDiaria ? `R$ ${vaga.valorDiaria}` : vaga.salario || '—'}</p>
                      <p>📅 Tipo: {vaga.tipo || '—'}</p>
                      <p className="text-sm text-gray-600 mt-1">{vaga.descricao}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      {renderConteudo()}
      <MenuInferiorFreela onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}