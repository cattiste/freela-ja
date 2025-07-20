import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function AvaliacoesRecebidasFreela({ freelaUid }) {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!freelaUid) return

    const q = query(collection(db, 'avaliacoesFreelas'), where('freelaUid', '==', freelaUid))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const avals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAvaliacoes(avals)
        setLoading(false)
      },
      (error) => {
        console.error('Erro ao buscar avaliações:', error)
        setErro('Erro ao carregar avaliações.')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [freelaUid])

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

  if (loading) return <p className="text-center text-gray-600">Carregando avaliações...</p>
  if (erro) return <p className="text-center text-red-600">{erro}</p>
  if (avaliacoes.length === 0)
    return <p className="text-center text-gray-600">Nenhuma avaliação recebida ainda.</p>

  return (
    <div className="space-y-4">
      {avaliacoes.map(avaliacao => (
        <div key={avaliacao.id} className="border p-4 rounded shadow-sm bg-white">
          {renderEstrelas(avaliacao.nota)}
          <p className="text-sm mt-1"><strong>Comentário:</strong> {avaliacao.comentario || 'Sem comentário'}</p>
          <p className="text-xs text-gray-500 italic mt-1">
            {avaliacao.estabelecimentoNome || 'Estabelecimento'} —
            {' '}
            {avaliacao.dataCriacao?.toDate
              ? avaliacao.dataCriacao.toDate().toLocaleDateString('pt-BR')
              : 'Data não disponível'}
          </p>
        </div>
      ))}
    </div>
  )
}
