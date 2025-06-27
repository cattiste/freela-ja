import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from @/firebase'

export default function AgendasContratadas({ estabelecimento }) {
  const [contratacoes, setContratacoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    async function carregarContratacoes() {
      setCarregando(true)
      try {
        // Buscar chamadas com status 'aceita' do estabelecimento
        const q = query(
          collection(db, 'chamadas'),
          where('estabelecimentoUid', '==', estabelecimento.uid),
          where('status', '==', 'aceita')
        )
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setContratacoes(lista)
      } catch (err) {
        console.error('Erro ao carregar contratações:', err)
        alert('Erro ao carregar contratações.')
      }
      setCarregando(false)
    }

    carregarContratacoes()
  }, [estabelecimento])

  if (carregando) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando contratações...
      </div>
    )
  }

  if (contratacoes.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Nenhuma contratação confirmada até o momento.
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-700 mb-4 text-center">
        📅 Agendas Contratadas
      </h2>

      <div className="space-y-6 max-w-4xl mx-auto">
        {contratacoes.map((contrato) => (
          <div key={contrato.id} className="bg-white rounded-xl shadow p-4 border border-orange-200">
            <h3 className="text-xl font-semibold text-orange-700">{contrato.freelaNome}</h3>
            <p><strong>Datas Confirmadas:</strong> {contrato.datasConfirmadas ? contrato.datasConfirmadas.join(', ') : 'Não informado'}</p>
            <p><strong>Valor da Diária:</strong> {contrato.valorDiaria ? `R$ ${contrato.valorDiaria}` : 'Não informado'}</p>
            <button
              onClick={() => alert('Função para avaliar disponível na aba Avaliar')}
              className="btn-primary mt-3"
            >
              Avaliar Freelancer
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
