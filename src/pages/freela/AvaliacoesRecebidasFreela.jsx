// src/pages/freela/AvaliacoesRecebidasFreela.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function AvaliacoesRecebidasFreela({ freelaUid }) {
  const { usuario } = useAuth()
  const uid = freelaUid || usuario?.uid
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroPermissao, setErroPermissao] = useState(false)

  useEffect(() => {
    const buscarAvaliacoes = async () => {
      if (!uid) return

      try {
       const q = query(
        collection(db, 'avaliacoesFreelas'),
        where('freelaUid', '==', uid),
        orderBy('criadoEm', 'desc'),
        limit(3)
      )

        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        
        setAvaliacoes(lista)
      } catch (err) {
        console.error('Erro ao buscar avaliações:', err)
        if (err?.code === 'permission-denied') setErroPermissao(true)
      } finally {
        setCarregando(false)
      }
    }

    buscarAvaliacoes()
  }, [uid])

  if (!uid) {
    return (
      <div className="text-center text-red-600 mt-10">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </div>
    )
  }

  if (carregando) {
    return (
      <div className="text-center text-orange-600 mt-10">
        🔄 Carregando avaliações recebidas...
      </div>
    )
  }

  if (erroPermissao) {
    return (
      <div className="text-center text-red-500 mt-6 text-sm">
        ❌ Sem permissão para visualizar as avaliações. Verifique suas regras do Firestore.
      </div>
    )
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow col-span-1">
      <h1 className="text-xl font-bold text-blue-700 mb-4 text-center">
        ⭐ Avaliações Recebidas
      </h1>

      {avaliacoes.length === 0 ? (
        <p className="text-center text-gray-600">
          Nenhuma avaliação recebida ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => (
            <div key={avaliacao.id} className="bg-gray-50 border p-3 rounded-xl shadow-sm">
              <p className="text-sm text-gray-800">
                <strong>Contratante:</strong>{' '}
                {avaliacao.contratanteNome || '---'}
              </p>
              <p className="text-sm text-gray-600 italic">
                "{avaliacao.comentario || 'Sem comentário'}"
              </p>
              <p className="text-orange-600 mt-1">⭐ Nota: {avaliacao.nota || '---'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
