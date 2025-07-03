import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function MinhasVagas({ estabelecimento, onEditar }) {
  const [vagas, setVagas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscarVagas = async () => {
      if (!estabelecimento?.email) return
      try {
        const q = query(collection(db, 'vagas'), where('emailContato', '==', estabelecimento.email))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
      } finally {
        setCarregando(false)
      }
    }

    buscarVagas()
  }, [estabelecimento?.email])

  const excluirVaga = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        await deleteDoc(doc(db, 'vagas', id))
        setVagas(prev => prev.filter(vaga => vaga.id !== id))
      } catch (error) {
        console.error('Erro ao excluir vaga:', error)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-600">📋 Minhas Vagas Publicadas</h2>
        {/* Botão "+ Nova Vaga" removido */}
      </div>

      {carregando ? (
        <p className="text-center text-gray-600">Carregando vagas...</p>
      ) : vagas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma vaga publicada ainda.</p>
      ) : (
        <div className="space-y-4">
          {vagas.map(vaga => (
            <div key={vaga.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              <h3 className="text-lg font-semibold text-orange-700">{vaga.titulo || 'Sem título'}</h3>
              <p><strong>Tipo:</strong> {vaga.tipo || 'Não informado'}</p>
              <p><strong>Cidade:</strong> {vaga.cidade || 'Não informado'}</p>
              <p><strong>Salário:</strong> {vaga.salario ? `R$ ${Number(vaga.salario).toFixed(2).replace('.', ',')}` : 'Não informado'}</p>
              <p className="text-sm text-gray-600 mt-2">{vaga.descricao || 'Sem descrição'}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => excluirVaga(vaga.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                >
                  🗑️ Excluir
                </button>

                <button
                  onClick={() => onEditar?.(vaga)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                >
                  ✏️ Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
