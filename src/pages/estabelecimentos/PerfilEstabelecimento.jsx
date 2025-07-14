import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function PerfilEstabelecimento() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [estab, setEstab] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarEstab() {
      try {
        const estabRef = doc(db, 'usuarios', uid)
        const estabSnap = await getDoc(estabRef)

        if (!estabSnap.exists()) {
          setErro('Estabelecimento não encontrado.')
          setCarregando(false)
          return
        }

        setEstab(estabSnap.data())

        const q = query(
          collection(db, 'avaliacoesEstabelecimentos'),
          where('estabelecimentoUid', '==', uid),
          orderBy('dataCriacao', 'desc')
        )
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAvaliacoes(lista)

        if (lista.length > 0) {
          const soma = lista.reduce((total, av) => total + av.nota, 0)
          const media = soma / lista.length
          setEstab((prev) => ({ ...prev, mediaAvaliacao: media }))
        }

      } catch (e) {
        console.error(e)
        setErro('Erro ao carregar dados do estabelecimento.')
      } finally {
        setCarregando(false)
      }
    }

    carregarEstab()
  }, [uid])

  const renderEstrelas = (nota) => {
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

  const formatarData = (data) => {
    try {
      return data?.toDate().toLocaleDateString('pt-BR') || '—'
    } catch {
      return '—'
    }
  }

  if (carregando) return <p className="p-6">Carregando perfil...</p>
  if (erro) return <p className="p-6 text-red-500">{erro}</p>

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-6 text-center">
        <h1 className="text-2xl font-bold text-yellow-700 mb-1">{estab.nome}</h1>
        <p className="text-gray-600 mb-2">{estab.endereco}</p>
        {estab.telefone && <p className="text-gray-600 mb-2">📞 {estab.telefone}</p>}

        {estab.mediaAvaliacao && (
          <>
            {renderEstrelas(estab.mediaAvaliacao)}
            <p className="text-gray-600 text-sm mb-2">
              Avaliação média: {estab.mediaAvaliacao.toFixed(1)} / 5
            </p>
          </>
        )}

        {avaliacoes.length > 0 && (
          <div className="mt-6 text-left">
            <h3 className="text-sm font-bold text-yellow-700 mb-2">⭐ Avaliações Recebidas</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {avaliacoes.map((av) => (
                <div key={av.id} className="bg-gray-50 p-2 rounded border border-gray-200">
                  {renderEstrelas(av.nota)}
                  <p className="text-gray-700 text-sm">{av.comentario || 'Sem comentário'}</p>
                  <p className="text-xs text-gray-500 italic mt-1">
                    {av.freelaNome || 'Freela'} — {formatarData(av.dataCriacao)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {user && user.tipo === 'freela' && user.uid !== uid && (
          <button
            onClick={() => navigate(`/avaliacao/estabelecimento/${uid}`)}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition"
          >
            Avaliar este Estabelecimento
          </button>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
        >
          ← Voltar
        </button>
      </div>
    </div>
  )
}
