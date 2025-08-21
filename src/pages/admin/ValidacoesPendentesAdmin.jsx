import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ValidacoesPendentesAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const carregarUsuariosPendentes = async () => {
      const q = query(collection(db, 'usuarios'), where('validacao', '==', 'pendente'))
      const snapshot = await getDocs(q)
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsuarios(lista)
      setCarregando(false)
    }

    carregarUsuariosPendentes()
  }, [])

  const atualizarStatus = async (id, novoStatus) => {
    await updateDoc(doc(db, 'usuarios', id), { validacao: novoStatus })
    setUsuarios(prev => prev.filter(u => u.id !== id))
  }

  if (carregando) return <p>Carregando validações pendentes...</p>
  if (usuarios.length === 0) return <p>Nenhum usuário aguardando validação.</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Validações Pendentes</h1>
      <div className="grid gap-6">
        {usuarios.map(usuario => (
          <div key={usuario.id} className="border p-4 rounded bg-white shadow">
            <p className="font-semibold mb-2">{usuario.nome || 'Sem nome'} ({usuario.email})</p>
            <div className="flex flex-wrap gap-4 mb-4">
              <img src={usuario.documentoFrente} alt="Frente do documento" className="w-48 rounded border" />
              <img src={usuario.documentoVerso} alt="Verso do documento" className="w-48 rounded border" />
            </div>
            <div className="flex gap-2">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                onClick={() => atualizarStatus(usuario.id, 'aprovada')}
              >
                ✅ Aprovar
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                onClick={() => atualizarStatus(usuario.id, 'reprovada')}
              >
                ❌ Reprovar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
