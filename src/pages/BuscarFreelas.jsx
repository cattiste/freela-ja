import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

export default function BuscarFreelas() {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const buscar = async () => {
      try {
        const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
        const snapshot = await getDocs(q)
        const resultado = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setFreelas(resultado)
      } catch (err) {
        console.error('Erro ao buscar freelas:', err)
        setErro('Erro ao buscar freelas.')
      } finally {
        setCarregando(false)
      }
    }

    buscar()
  }, [])

  if (carregando) return <div className="p-4">🔄 Carregando freelancers...</div>
  if (erro) return <div className="p-4 text-red-500">{erro}</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">🔍 Freelancers</h2>
      {freelas.length === 0 ? (
        <p className="text-gray-600">Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freelas.map(f => (
            <div key={f.id} className="bg-white shadow p-4 rounded-xl flex gap-4 items-center">
              <img src={f.foto || '/avatar.png'} className="w-16 h-16 rounded-full object-cover" alt="" />
              <div>
                <h3 className="text-lg font-bold">{f.nome}</h3>
                <p className="text-sm text-gray-600">{f.funcao}</p>
                <p className="text-xs text-gray-400">{f.endereco}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
