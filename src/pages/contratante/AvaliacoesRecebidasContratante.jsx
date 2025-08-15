// src/pages/estabelecimento/AvaliacoesRecebidasEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function AvaliacoesRecebidasEstabelecimento() {
  const { usuario } = useAuth()
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarAvaliacoes = async () => {
      if (!usuario?.uid) return

      try {
        const q = query(
          collection(db, 'chamadas'),
          where('estabelecimentoUid', '==', usuario.uid)
        )

        const snap = await getDocs(q)
        const avaliadas = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(chamada => chamada.avaliacaoEstabelecimento?.nota)

        setAvaliacoes(avaliadas)
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

      {avaliacoes.map((chamada) => (
        <div key={chamada.id} className="bg-white border p-4 rounded-xl shadow-sm">
          <p className="text-orange-700 font-semibold">
            👨‍🍳 Freela: {chamada.freelaNome || '---'}
          </p>
          <p className="text-gray-800 italic mt-1">
            "{chamada.avaliacaoEstabelecimento?.comentario || 'Sem comentário'}"
          </p>
          <p className="text-yellow-600 mt-2">⭐ Nota: {chamada.avaliacaoEstabelecimento?.nota || '--'}</p>
        </div>
      ))}
    </div>
  )
}
