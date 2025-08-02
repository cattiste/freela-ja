// src/pages/estabelecimento/EditarEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'

export default function EditarEstabelecimento() {
  const navigate = useNavigate()
  const [dados, setDados] = useState({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          setDados(snap.data())
        }

        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value })
  }

  const salvar = async () => {
    try {
      const ref = doc(db, 'usuarios', auth.currentUser.uid)
      await updateDoc(ref, dados)
      alert('✅ Perfil atualizado com sucesso!')
      navigate('/painelestabelecimento')
    } catch (err) {
      console.error(err)
      alert('Erro ao atualizar perfil.')
    }
  }

  if (carregando) return <p className="p-4 text-orange-600">Carregando dados...</p>

  return (
    <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold text-orange-700 mb-4">✏️ Editar Perfil</h2>

        <label className="block mb-2 text-sm font-medium">Foto (URL)</label>
        <input name="foto" value={dados.foto || ''} onChange={handleChange} className="input" />

        <label className="block mt-4 mb-2 text-sm font-medium">Nome</label>
        <input name="nome" value={dados.nome || ''} onChange={handleChange} className="input" />

        <label className="block mt-4 mb-2 text-sm font-medium">Especialidade</label>
        <input name="especialidade" value={dados.especialidade || ''} onChange={handleChange} className="input" />

        <label className="block mt-4 mb-2 text-sm font-medium">Celular</label>
        <input name="celular" value={dados.celular || ''} onChange={handleChange} className="input" />

        <label className="block mt-4 mb-2 text-sm font-medium">Endereço</label>
        <input name="endereco" value={dados.endereco || ''} onChange={handleChange} className="input" />

        <label className="block mt-4 mb-2 text-sm font-medium">CNPJ</label>
        <input name="cnpj" value={dados.cnpj || ''} onChange={handleChange} className="input" />

        <button
          onClick={salvar}
          className="mt-6 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  )
}
