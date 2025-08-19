// src/pages/contratante/AvaliacoesRecebidasContratante.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function AvaliacoesRecebidasContratante() {
  const { usuario } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarAvaliacoes = async () => {
      if (!usuario?.uid) return

      try {
        const q = query(
          collection(db, 'avaliacoesContratantes'),
          where('contratanteUid', '==', usuario.uid),
          orderBy('criadoEm', 'desc') // ordena pela data, se existir
        )

        const snap = await getDocs(q)
        const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setAvaliacoes(docs)
      } catch (err) {
        console.error('Erro ao buscar avaliações:', err)
      } finally {
        setCarregando(false)
      }
    }

    buscarAvaliacoes()
  }, [usuario])

  if (carregando) {
    return <div className="text-center text-orange-600 mt-10">🔄 Carregando avaliações recebidas...</div>
  }

  if (avaliacoes.length === 0) {
    return <div className="text-center text-gray-600 mt-10">Nenhuma avaliação recebida ainda.</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-blue-700 text-center mb-4">
        ⭐ Avaliações Recebidas
      </h1>

      {avaliacoes.map((avaliacao) => (
        <div key={avaliacao.id} className="bg-white border p-4 rounded-xl shadow-sm">
          <p className="text-orange-700 font-semibold">
            👨‍🍳 Freela: {avaliacao.freelaNome || '---'}
          </p>
          <p className="text-gray-800 italic mt-1">
            "{avaliacao.comentario || 'Sem comentário'}"
          </p>
          <p className="text-yellow-600 mt-2">⭐ Nota: {avaliacao.nota || '--'}</p>
        </div>
      ))}
    </div>
  )
}
