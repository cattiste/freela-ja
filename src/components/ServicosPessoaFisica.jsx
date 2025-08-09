import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function ServicosPessoaFisica({ pessoaFisica }) {
  const [servicos, setServicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!pessoaFisica?.uid) return

    const buscarServicos = async () => {
      try {
        const q = query(
          collection(db, 'servicos'),
          where('pessoaFisicaUid', '==', pessoaFisica.uid)
        )
        const snapshot = await getDocs(q)
        setServicos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        console.error('Erro ao buscar serviços:', err)
        toast.error('Erro ao carregar serviços')
      } finally {
        setCarregando(false)
      }
    }

    buscarServicos()
  }, [pessoaFisica])

  const excluirServico = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await deleteDoc(doc(db, 'servicos', id))
        setServicos(prev => prev.filter(s => s.id !== id))
        toast.success('Serviço excluído com sucesso!')
      } catch (err) {
        console.error('Erro ao excluir serviço:', err)
        toast.error('Erro ao excluir serviço')
      }
    }
  }

  if (carregando) {
    return <div className="text-center text-orange-600 mt-10">Carregando serviços...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-orange-700">📋 Meus Serviços</h2>
        <button
          onClick={() => navigate('/pessoa-fisica/publicarservico')}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >
          + Novo Serviço
        </button>
      </div>

      {servicos.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-xl shadow border border-orange-100">
          <p className="text-gray-600 mb-4">Nenhum serviço cadastrado ainda.</p>
          <button
            onClick={() => navigate('/pessoa-fisica/publicarservico')}
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            Criar Primeiro Serviço
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicos.map((servico) => (
            <div key={servico.id} className="bg-white p-4 rounded-xl shadow border border-orange-100">
              <h3 className="text-lg font-bold text-orange-700">{servico.titulo}</h3>
              <p className="text-gray-600 text-sm mt-1">{servico.funcao}</p>
              <p className="text-gray-700 mt-2">{servico.descricao}</p>
              
              {servico.valorDiaria && (
                <p className="text-orange-700 font-semibold mt-2">
                  💰 R$ {servico.valorDiaria} / diária
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/pessoa-fisica/editarservico/${servico.id}`)}
                  className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => excluirServico(servico.id)}
                  className="flex-1 bg-red-600 text-white py-1 rounded hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}