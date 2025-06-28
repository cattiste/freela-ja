<<<<<<< HEAD
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { profissionais } from '../data/profissionais' // ✅ Importa o array centralizado

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()

  const profissional = profissionais.find(p => p.id === id)

  if (!profissional) {
    return <div className="perfil-container">Profissional não encontrado.</div>
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <img src={profissional.imagem} alt={profissional.nome} />
        <div className="perfil-info">
          <h2>{profissional.nome}</h2>
          <p><strong>Especialidade:</strong> {profissional.especialidade}</p>
          <p><strong>Cidade:</strong> {profissional.cidade}</p>
          <p className="perfil-avaliacao">⭐ {profissional.avaliacao}</p>
        </div>
      </div>

      <p>{profissional.descricao}</p>

      <button className="botao-voltar" onClick={() => navigate(-1)}>
        Voltar
      </button>
=======
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PerfilFreela() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarFreela() {
      try {
        if (!uid) {
          setErro('ID do freelancer não informado.')
          setCarregando(false)
          return
        }
        const freelaRef = doc(db, 'usuarios', uid)
        const freelaSnap = await getDoc(freelaRef)

        if (!freelaSnap.exists()) {
          setErro('Freelancer não encontrado.')
          setCarregando(false)
          return
        }

        setFreela(freelaSnap.data())
      } catch (e) {
        console.error(e)
        setErro('Erro ao carregar dados do freelancer.')
      } finally {
        setCarregando(false)
      }
    }

    carregarFreela()
  }, [uid])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 font-semibold text-xl">
        Carregando perfil...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-bold text-xl">
        {erro}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-8 text-center">
        <img
          src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
          alt={freela.nome}
          className="mx-auto w-32 h-32 rounded-full object-cover border-2 border-blue-400 shadow mb-6"
        />
        <h1 className="text-3xl font-bold text-blue-700 mb-2">{freela.nome}</h1>
        <p className="text-blue-600 text-lg mb-1">{freela.funcao || freela.especialidade}</p>
        <p className="text-gray-600 mb-4">{freela.endereco}</p>
        <p className="text-gray-700 mb-4 italic">{freela.descricao}</p>
        {freela.diaria && (
          <p className="text-green-700 font-semibold">
            💰 Valor da diária: {freela.diaria}
          </p>
        )}
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          ← Voltar
        </button>
      </div>
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    </div>
  )
}
