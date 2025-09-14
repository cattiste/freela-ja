import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function AvaliacoesRecebidasFreela({ freelaUid }) {
  const { usuario } = useAuth()
  const uid = freelaUid || usuario?.uid
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarAvaliacoes = async () => {
      if (!uid) return
      try {
        const q = query(
          collection(db, 'avaliacoes'),   // 👈 ajuste o nome da coleção que você realmente usa
          where('freelaId', '==', uid),
          orderBy('criadoEm', 'desc'),
          limit(3) // só 3 últimas
        )
        const snapshot = await getDocs(q)
        setAvaliacoes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        console.error('Erro ao buscar avaliações:', err)
      } finally {
        setCarregando(false)
      }
    }
    buscarAvaliacoes()
  }, [uid])

  if (carregando) return <p className="text-center mt-6">🔄 Carregando avaliações…</p>

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold text-blue-700 mb-4 text-center">⭐ Avaliações Recebidas</h1>
      {avaliacoes.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma avaliação recebida ainda.</p>
      ) : (
        <div className="space-y-3">
          {avaliacoes.map(av => (
            <div key={av.id} className="bg-gray-50 border p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-800">
                <strong>Contratante:</strong> {av.contratanteNome || '---'}
              </p>
              <p className="text-sm text-gray-600 italic">"{av.comentario || 'Sem comentário'}"</p>
              <p className="text-yellow-600 mt-1">⭐ Nota: {av.nota || '---'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
