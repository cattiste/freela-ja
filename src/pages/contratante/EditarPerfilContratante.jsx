// src/pages/estabelecimento/EditarPerfilEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'

export default function EditarPerfilEstabelecimento() {
  const navigate = useNavigate()
  const [dados, setDados] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [foto, setFoto] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          const data = snap.data()
          setDados(data)
          setFoto(data.foto || '')
        }

        setCarregando(false)
      } else {
        navigate('/login')
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value })
  }

  const handleUpload = async (e) => {
    const arquivo = e.target.files[0]
    if (!arquivo) return

    try {
      const formData = new FormData()
      formData.append('file', arquivo)
      formData.append('upload_preset', 'preset-publico') // 🔁 substitua se seu preset tiver outro nome
      formData.append('folder', 'perfil/fotos')

      const res = await fetch('https://api.cloudinary.com/v1_1/dbemvuau3/image/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setFoto(data.secure_url)
        alert('✅ Imagem enviada com sucesso!')
      } else {
        throw new Error('Erro no upload da imagem')
      }
    } catch (err) {
      console.error('Erro no upload:', err)
      alert('Erro ao enviar imagem.')
    }
  }

  const salvar = async () => {
    setSalvando(true)
    try {
      const ref = doc(db, 'usuarios', auth.currentUser.uid)
      await updateDoc(ref, { ...dados, foto })
      alert('✅ Perfil atualizado com sucesso!')
      navigate('/painelestabelecimento')
    } catch (err) {
      console.error(err)
      alert('Erro ao atualizar perfil.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p className="p-4 text-orange-600">Carregando dados...</p>

  return (
    <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl space-y-4">
        <h2 className="text-2xl font-bold text-orange-700">✏️ Editar Perfil do Estabelecimento</h2>

        <div className="flex items-center gap-4">
          <img
            src={foto || 'https://placehold.co/100x100'}
            alt="Foto do Estabelecimento"
            className="w-20 h-20 rounded-full object-cover border border-orange-500"
          />
          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>

        <label className="block text-sm font-medium">Nome</label>
        <input
          name="nome"
          value={dados.nome || ''}
          onChange={handleChange}
          className="input"
        />

        <label className="block text-sm font-medium">Especialidade</label>
        <input
          name="especialidade"
          value={dados.especialidade || ''}
          onChange={handleChange}
          className="input"
        />

        <label className="block text-sm font-medium">Celular</label>
        <input
          name="celular"
          value={dados.celular || ''}
          onChange={handleChange}
          className="input"
        />

        <label className="block text-sm font-medium">Endereço</label>
        <input
          name="endereco"
          value={dados.endereco || ''}
          onChange={handleChange}
          className="input"
        />

        <label className="block text-sm font-medium">CNPJ</label>
        <input
          name="cnpj"
          value={dados.cnpj || ''}
          onChange={handleChange}
          className="input"
        />

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full mt-4 bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
