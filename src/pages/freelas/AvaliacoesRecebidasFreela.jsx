import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function AvaliacoesRecebidasFreela({ freelaUid }) {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarAvaliacoes = async () => {
      try {
        const avaliacoesRef = collection(db, 'avaliacoes')
        const q = query(
          avaliacoesRef,
          where('freelaUid', '==', freelaUid),
          orderBy('data', 'desc')
        )
        const snapshot = await getDocs(q)

        const lista = await Promise.all(snapshot.docs.map(async docSnap => {
          const data = docSnap.data()

          // Buscar nome do estabelecimento (opcional, caso queira mostrar nome)
          let estabelecimentoNome = 'Estabelecimento Desconhecido'
          if (data.estabelecimentoUid) {
            const estRef = doc(db, 'usuarios', data.estabelecimentoUid)
            const estSnap = await getDoc(estRef)
            if (estSnap.exists()) {
              estabelecimentoNome = estSnap.data().nome || estabelecimentoNome
            }
          }

          return {
            id: docSnap.id,
            ...data,
            estabelecimentoNome
          }
        }))

        setAvaliacoes(lista)
      } catch (err) {
        console.error('Erro ao buscar avaliações:', err)
      } finally {
        setCarregando(false)
      }
    }

    if (freelaUid) buscarAvaliacoes()
  }, [freelaUid])

  if (carregando) return <p className="text-orange-600 text-center">Carregando avaliações...</p>

  if (avaliacoes.length === 0) return <p className="text-gray-600 text-center">Nenhuma avaliação recebida ainda.</p>

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">⭐ Avaliações Recebidas</h2>
      {avaliacoes.map(av => (
        <div key={av.id} className="border rounded p-3 shadow-sm">
          <p><strong>Estabelecimento:</strong> {av.estabelecimentoNome}</p>
          <p><strong>Nota:</strong> {av.nota} ★</p>
          <p><strong>Comentário:</strong> {av.comentario || 'Sem comentário'}</p>
          <p><strong>Data:</strong> {av.data?.toDate ? av.data.toDate().toLocaleDateString() : 'N/A'}</p>
        </div>
      ))}
    </div>
  )
}
