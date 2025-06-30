import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

export default function BuscarFreelas() {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const buscarFreelas = async () => {
      try {
        const q = query(
          collection(db, 'usuarios'),
          where('tipo', '==', 'freela') // Só busca quem é freela
        )

        const querySnapshot = await getDocs(q)
        const lista = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setFreelas(lista)
      } catch (err) {
        console.error('Erro ao buscar freelancers:', err)
        setErro('Não foi possível carregar os freelancers. Verifique sua conexão ou permissões.')
      } finally {
        setCarregando(false)
      }
    }

    buscarFreelas()
  }, [])

  if (carregando) return <div className="p-4 text-gray-500">Carregando freelancers...</div>
  if (erro) return <div className="p-4 text-red-600">{erro}</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-orange-700">📋 Freelancers Disponíveis</h2>
      {freelas.length === 0 ? (
        <p>Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freelas.map(freela => (
            <div key={freela.id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
              <img
                src={freela.foto || '/avatar-padrao.png'}
                alt={freela.nome}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">{freela.nome}</h3>
                <p className="text-sm text-gray-600">{freela.funcao}</p>
                <p className="text-sm text-gray-500">{freela.endereco}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
