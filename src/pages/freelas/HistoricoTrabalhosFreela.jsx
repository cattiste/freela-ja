import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

export default function HistoricoTrabalhosFreela({ freelaUid }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        const chamadasRef = collection(db, 'chamadas')
        const q = query(
          chamadasRef,
          where('freelaUid', '==', freelaUid),
          where('status', 'in', ['finalizado', 'concluido']),
          orderBy('dataCandidatura', 'desc')
        )
        const snapshot = await getDocs(q)

        const lista = snapshot.docs.map(doc => {
          const data = doc.data()
          return { id: doc.id, ...data }
        })

        setHistorico(lista)
      } catch (err) {
        console.error('Erro ao buscar histórico:', err)
      } finally {
        setCarregando(false)
      }
    }

    if (freelaUid) buscarHistorico()
  }, [freelaUid])

  if (carregando) return <p className="text-orange-600 text-center">Carregando histórico...</p>

  if (historico.length === 0) return <p className="text-gray-600 text-center">Nenhum trabalho finalizado ainda.</p>

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">📜 Histórico de Trabalhos</h2>
      {historico.map(item => (
        <div key={item.id} className="border rounded p-3 shadow-sm">
          <p><strong>Vaga:</strong> {item.vagaTitulo || item.vagaId || 'Não informado'}</p>
          <p><strong>Estabelecimento:</strong> {item.estabelecimentoNome || item.estabelecimentoUid}</p>
          <p><strong>Data:</strong> {item.dataCandidatura?.toDate ? item.dataCandidatura.toDate().toLocaleString() : 'Não informado'}</p>
          <p><strong>Status:</strong> {item.status}</p>
          {item.avaliacao && (
            <p><strong>Avaliação:</strong> {item.avaliacao.nota} ★ - {item.avaliacao.comentario}</p>
          )}
        </div>
      ))}
    </div>
  )
}
