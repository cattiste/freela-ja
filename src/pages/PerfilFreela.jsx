import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PerfilFreela({ freelaUidProp, mostrarBotaoVoltar = true }) {
  const params = useParams()
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const uid = freelaUidProp || params.uid

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

  // Função para exibir estrelas
  const renderEstrelas = nota => {
    const estrelasCheias = Math.floor(nota)
    const meiaEstrela = nota % 1 >= 0.5
    const estrelasVazias = 5 - estrelasCheias - (meiaEstrela ? 1 : 0)

    return (
      <div className="flex justify-center text-yellow-500 text-xl mb-2">
        {'★'.repeat(estrelasCheias)}
        {meiaEstrela && '☆'}
        {'☆'.repeat(estrelasVazias)}
      </div>
    )
  }

  // Formata o valor da diária para moeda brasileira
  const formatarValor = valor => {
    if (!valor) return null
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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
        <p className="text-blue-600 text-lg mb-1">{freela.funcao || freela.especialidades}</p>
        <p className="text-gray-600 mb-2">{freela.endereco}</p>
        {freela.celular && (
          <p className="text-gray-600 mb-2">📱 {freela.celular}</p>
        )}

        {/* Estrelas de avaliação se houver */}
        {freela.mediaAvaliacao && (
          <>
            {renderEstrelas(freela.mediaAvaliacao)}
            <p className="text-gray-600 text-sm mb-2">
              Avaliação média: {freela.mediaAvaliacao.toFixed(1)} / 5
            </p>
          </>
        )}

        {/* Descrição */}
        {freela.descricao && (
          <p className="text-gray-700 mb-4 italic">{freela.descricao}</p>
        )}

        {/* Valor da diária */}
        {freela.valorDiaria && (
          <p className="text-green-700 font-semibold">
            💰 Valor da diária: {formatarValor(freela.valorDiaria)}
          </p>
        )}

        {/* Botões */}
        {mostrarBotaoVoltar && (
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            ← Voltar
          </button>
        )}
      </div>
    </div>
  )
}
