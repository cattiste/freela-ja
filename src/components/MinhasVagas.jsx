import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useNavigate } from 'react-router-dom'

export default function MinhasVagas() {
  const [vagas, setVagas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
  const navigate = useNavigate()

  useEffect(() => {
    const buscarVagas = async () => {
      if (!usuario?.email) return
      try {
        const q = query(collection(db, 'vagas'), where('emailContato', '==', usuario.email))
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
  }, [usuario?.email])

  const excluirVaga = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta vaga?')) {
      try {
        await deleteDoc(doc(db, 'vagas', id))
        setVagas(vagas.filter(vaga => vaga.id !== id))
      } catch (error) {
        console.error('Erro ao excluir vaga:', error)
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-20 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-600">Minhas Vagas Publicadas</h2>
        <button
          onClick={() => navigate('/publicarvaga')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
        >
          + Nova Vaga
        </button>
      </div>

      {carregando ? (
        <p className="text-center text-gray-600">Carregando vagas...</p>
      ) : vagas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma vaga publicada ainda.</p>
      ) : (
        <div className="space-y-4">
          {vagas.map(vaga => (
            <div key={vaga.id} className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
              <h3 className="text-lg font-semibold text-orange-700">{vaga.titulo}</h3>
              <p><strong>Tipo:</strong> {vaga.tipo}</p>
              <p><strong>Cidade:</strong> {vaga.cidade}</p>
              <p><strong>Salário:</strong> {vaga.salario}</p>
              <p className="text-sm text-gray-600 mt-2">{vaga.descricao}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => excluirVaga(vaga.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                >
                  Excluir
                </button>
                {/* Aqui você pode incluir botão de editar no futuro */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
