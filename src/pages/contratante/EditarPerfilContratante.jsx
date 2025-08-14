// src/pages/contratante/EditarPerfilContratante.jsx
import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import InputMask from 'react-input-mask'
import { mask as masker } from 'remask'

export default function EditarPerfilContratante() {
  const navigate = useNavigate()
  const [dados, setDados] = useState({})
  const [foto, setFoto] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
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

    return () => unsub()
  }, [navigate])

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value })
  }

  const handleUpload = async (e) => {
    const arquivo = e.target.files[0]
    if (!arquivo) return

    const formData = new FormData()
    formData.append('file', arquivo)
    formData.append('upload_preset', 'preset-publico')
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
      alert('Erro ao enviar imagem.')
    }
  }

  const salvar = async () => {
    setSalvando(true)
    try {
      const ref = doc(db, 'usuarios', auth.currentUser.uid)
      await updateDoc(ref, {
        ...dados,
        foto,
        tipo: 'contratante'
      })
      alert('✅ Perfil atualizado com sucesso!')
      navigate('/painelcontratante')
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar perfil.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p className="p-4 text-orange-600">Carregando dados...</p>

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl space-y-4">
        <h2 className="text-2xl font-bold text-orange-700">✏️ Editar Perfil do Contratante</h2>

        <div className="flex items-center gap-4">
          <img
            src={foto || 'https://placehold.co/100x100'}
            alt="Foto"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Nome</label>
          <input name="nome" value={dados.nome || ''} onChange={handleChange} className="input" />

          <label className="block text-sm font-medium">Especialidade</label>
          <input name="especialidade" value={dados.especialidade || ''} onChange={handleChange} className="input" />

          <label className="block text-sm font-medium">Celular</label>
          <input name="celular" value={dados.celular || ''} onChange={handleChange} className="input" />

          <label className="block text-sm font-medium">Endereço</label>
          <input name="endereco" value={dados.endereco || ''} onChange={handleChange} className="input" />

          <label className="block text-sm font-medium">CPF ou CNPJ</label>
          <input
            name="cnpj"
            value={dados.cnpj || ''}
            onChange={(e) => {
               const raw = e.target.value.replace(/\D/g, '')
               const masked = masker(raw, ['999.999.999-99', '99.999.999/9999-99'])
               setDados({ ...dados, cnpj: masked })
             }}
             maxLength={18}
             className="input"
          /> 
        </div>

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
