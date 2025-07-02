import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function MinhasVagas({ estabelecimento, onEditar }) {
  const [vagas, setVagas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchVagas() {
    setLoading(true)
    setError(null)
    try {
      const q = query(
        collection(db, 'vagas'),
        where('estabelecimentoUid', '==', estabelecimento.uid),
        where('status', '==', 'ativo')
      )
      const querySnapshot = await getDocs(q)
      const vagasData = []
      querySnapshot.forEach(docSnap => {
        vagasData.push({ id: docSnap.id, ...docSnap.data() })
      })
      setVagas(vagasData)
    } catch (err) {
      setError('Erro ao carregar vagas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (estabelecimento?.uid) {
      fetchVagas()
    }
  }, [estabelecimento])

  async function excluirVaga(id) {
    if (!confirm('Deseja realmente excluir essa vaga?')) return

    try {
      await deleteDoc(doc(db, 'vagas', id))
      setVagas(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      alert('Erro ao excluir vaga: ' + err.message)
    }
  }

  if (loading) return <p>Carregando vagas...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (vagas.length === 0) return <p>Você ainda não publicou nenhuma vaga.</p>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📋 Minhas Vagas Publicadas</h2>
      <div className="space-y-6">
        {vagas.map(vaga => (
          <div key={vaga.id} className="border p-4 rounded shadow space-y-2 bg-white">
            <h3 className="font-semibold text-xl">{vaga.titulo}</h3>
            <p><strong>Função:</strong> {vaga.função}</p>
            <p><strong>Tipo:</strong> {vaga.tipoVaga.toUpperCase()}</p>
            <p><strong>Descrição:</strong> {vaga.descricao}</p>
            <p><strong>Cidade:</strong> {vaga.cidade}</p>
            {vaga.tipoVaga === 'clt' && <p><strong>Salário:</strong> R$ {vaga.salario}</p>}
            {vaga.tipoVaga === 'freela' && (
              <>
                <p><strong>Valor diária:</strong> R$ {vaga.valorDiaria}</p>
                <p><strong>Datas agendadas:</strong> {vaga.datasAgendadas?.map(d => {
                  const dataFormatada = d.seconds ? new Date(d.seconds * 1000).toLocaleDateString() : d
                  return <span key={dataFormatada}>{dataFormatada} </span>
                })}</p>
              </>
            )}
            <p><strong>Urgente:</strong> {vaga.urgente ? 'Sim' : 'Não'}</p>

            <div className="flex space-x-3 mt-3">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => onEditar(vaga)}
              >
                ✏️ Editar
              </button>

              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={() => excluirVaga(vaga.id)}
              >
                🗑 Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
