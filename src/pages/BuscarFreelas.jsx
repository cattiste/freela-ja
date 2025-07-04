import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useNavigate } from 'react-router-dom'

export default function BuscarFreelas() {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const navigate = useNavigate()

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelas.map(f => (
            <div key={f.id} className="bg-white shadow-md p-5 rounded-xl border border-orange-100">
              <div className="flex items-center gap-4">
                <img
                  src={f.foto || '/avatar.png'}
                  className="w-16 h-16 rounded-full object-cover border"
                  alt="Foto do freelancer"
                />
                <div>
                  <h3 className="text-lg font-bold text-orange-700">{f.nome}</h3>
                  <p className="text-sm text-gray-600">{f.funcao}</p>
                  <p className="text-xs text-gray-500">{f.endereco}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/perfil/${f.id}`)}
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  👁 Ver Perfil
                </button>

                <button
                  onClick={() => alert(`Chamando ${f.nome}...`)}
                  className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  📞 Chamar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
