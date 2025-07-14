import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function PerfilFreela({ freelaUidProp, mostrarBotaoVoltar = true }) {
  const params = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [freela, setFreela] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
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

        const q = query(
          collection(db, 'avaliacoesFreelas'),
          where('freelaUid', '==', uid),
          orderBy('dataCriacao', 'desc')
        )
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAvaliacoes(lista)

        // Calcula média
        if (lista.length > 0) {
          const soma = lista.reduce((total, av) => total + av.nota, 0)
          const media = soma / lista.length
          setFreela((prev) => ({ ...prev, mediaAvaliacao: media }))
        }

      } catch (e) {
        console.error(e)
        setErro('Erro ao carregar dados do freelancer.')
      } finally {
        setCarregando(false)
      }
    }

    carregarFreela()
  }, [uid])

  const renderEstrelas = nota => {
    const estrelasCheias = Math.floor(nota)
    const meiaEstrela = nota % 1 >= 0.5
    const estrelasVazias = 5 - estrelasCheias - (meiaEstrela ? 1 : 0)

    return (
      <div className="flex text-yellow-500 text-lg">
        {'★'.repeat(estrelasCheias)}
        {meiaEstrela && '☆'}
        {'☆'.repeat(estrelasVazias)}
      </div>
    )
  }

  const formatarValor = valor => {
    if (!valor) return null
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatarData = data => {
    try {
      return data?.toDate().toLocaleDateString('pt-BR') || '—'
    } catch {
      return '—'
    }
  }

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
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-6 text-center">
        <img
          src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
          alt={freela.nome}
          className="mx-auto w-32 h-32 rounded-full object-cover border-2 border-blue-400 shadow mb-4"
        />
        <h1 className="text-2xl font-bold text-blue-700 mb-1">{freela.nome}</h1>
        <p className="text-blue-600 text-base mb-1">{freela.funcao || freela.especialidades}</p>
        <p className="text-gray-600 text-sm mb-2">{freela.endereco}</p>
        {freela.celular && <p className="text-gray-600 text-sm mb-2">📱 {freela.celular}</p>}

        {freela.mediaAvaliacao && (
          <>
            {renderEstrelas(freela.mediaAvaliacao)}
            <p className="text-gray-600 text-sm mb-2">
              Avaliação média: {freela.mediaAvaliacao.toFixed(1)} / 5
            </p>
          </>
        )}

        {freela.descricao && (
          <p className="text-gray-700 text-sm mb-3 italic">{freela.descricao}</p>
        )}

        {freela.valorDiaria && (
          <p className="text-green-700 font-semibold mb-4">
            💰 Valor da diária: {formatarValor(freela.valorDiaria)}
          </p>
        )}

        {avaliacoes.length > 0 && (
          <div className="mt-6 text-left">
            <h3 className="text-sm font-bold text-blue-700 mb-2">⭐ Avaliações Recebidas</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {avaliacoes.map((av) => (
                <div key={av.id} className="bg-gray-50 p-2 rounded border border-gray-200">
                  {renderEstrelas(av.nota)}
                  <p className="text-gray-700 text-sm">{av.comentario || 'Sem comentário'}</p>
                  <p className="text-xs text-gray-500 italic mt-1">
                    {av.estabelecimentoNome || 'Estabelecimento'} — {formatarData(av.dataCriacao)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {user && user.tipo === 'estabelecimento' && user.uid !== uid && (
          <button
            onClick={() => navigate(`/avaliacao/freela/${uid}`)}
            className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
          >
            Avaliar este Freela
          </button>
        )}

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
