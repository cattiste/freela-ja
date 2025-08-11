import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'

export default function HistoricoTrabalhosFreela({ freelaUid }) {
  const [historico, setHistorico] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [totalRecebido, setTotalRecebido] = useState(0)

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
          return { id: doc.id, valorPago: data.valorPago || 0, ...data }
        })
      }

        setHistorico(lista)

        // Total recebido
        const total = lista.reduce((acc, item) => acc + (item.valorPago || 0), 0)
        setTotalRecebido(total)
      } catch (err) {
        console.error('Erro ao buscar histórico:', err)
      } finally {
        setCarregando(false)
      }
    }

    if (freelaUid) buscarHistorico()
  }, [freelaUid])

  if (!freelaUid) {
    return (
      <div className="text-center text-red-600 mt-10">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </div>
    )
  }

  if (carregando) {
    return (
      <div className="text-center text-orange-600 mt-10">
        🔄 Carregando recebimentos...
      </div>
    )
  }

  if (historico.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        Nenhum trabalho finalizado ainda.
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">
        💸 Recebimentos
      </h2>

      <div className="bg-green-50 p-3 rounded-md text-green-700 text-center font-semibold shadow-sm">
        Total recebido até agora: R$ {totalRecebido.toFixed(2).replace('.', ',')}
      </div>

      {historico.map(item => (
        <div key={item.id} className="border rounded p-3 shadow-sm bg-white">
          <p><strong>Vaga:</strong> {item.vagaTitulo || item.vagaId || 'Não informado'}</p>
          <p><strong>Estabelecimento:</strong> {item.estabelecimentoNome || item.estabelecimentoUid}</p>
          <p><strong>Data:</strong> {item.dataCandidatura?.toDate ? item.dataCandidatura.toDate().toLocaleDateString('pt-BR') : 'Não informado'}</p>
          <p><strong>Status:</strong> {item.status}</p>
          <p><strong>Valor Recebido:</strong> R$ {Number(item.valorPago || 0).toFixed(2).replace('.', ',')}</p>
          {item.avaliacao && (
            <p><strong>Avaliação:</strong> {item.avaliacao.nota} ★ - {item.avaliacao.comentario}</p>
          )}
        </div>
      ))}
    </div>
  )
}
