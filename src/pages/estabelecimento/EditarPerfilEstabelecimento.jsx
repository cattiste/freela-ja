// src/pages/estabelecimento/EditarPerfilEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

// 🔁 Configure com seu cloudname e preset do Cloudinary
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/SEU_CLOUD_NAME/image/upload'
const UPLOAD_PRESET = 'SEU_UPLOAD_PRESET'

export default function EditarPerfilEstabelecimento() {
  const { uid } = useParams()        // não precisa, mas caso queira usar
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [estabelecimento, setEstabelecimento] = useState({
    nome: '',
    email: '',
    celular: '',
    endereco: '',
    descricao: '',
    foto: '',
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        navigate('/login')
        return
      }
      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)
        if (snap.exists() && snap.data().tipo === 'estabelecimento') {
          const data = snap.data()
          setEstabelecimento({
            nome: data.nome || '',
            email: data.email || usuario.email || '',
            celular: data.celular || '',
            endereco: data.endereco || '',
            descricao: data.descricao || '',
            foto: data.foto || '',
          })
          setFotoPreview(data.foto || null)
        } else {
          alert('Acesso negado: você não é um estabelecimento.')
          navigate('/login')
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        alert('Erro ao carregar perfil.')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setEstabelecimento(prev => ({ ...prev, [name]: value }))
  }

  async function uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Erro no upload da imagem')
    const data = await res.json()
    return data.secure_url
  }

  async function handleSalvar(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      const usuario = auth.currentUser
      if (!usuario) throw new Error('Usuário não autenticado')
      let fotoUrl = estabelecimento.foto
      if (foto) {
        fotoUrl = await uploadImage(foto)
      }
      const ref = doc(db, 'usuarios', usuario.uid)
      await updateDoc(ref, {
        nome: estabelecimento.nome,
        email: estabelecimento.email,
        celular: estabelecimento.celular,
        endereco: estabelecimento.endereco,
        descricao: estabelecimento.descricao,
        foto: fotoUrl,
      })
      alert('Perfil atualizado com sucesso!')
      navigate('/painelestabelecimento')
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar perfil.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Carregando dados do perfil...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6">
      <form onSubmit={handleSalvar} className="bg-white p-8 rounded-2xl shadow max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-6 text-orange-700">
          ✍️ Editar Perfil do Estabelecimento
        </h1>

        {/* Nome */}
        <label className="block mb-4">
          <span className="font-semibold text-gray-700">Nome</span>
          <input
            type="text"
            name="nome"
            value={estabelecimento.nome}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>

        {/* Email */}
        <label className="block mb-4">
          <span className="font-semibold text-gray-700">Email</span>
          <input
            type="email"
            name="email"
            value={estabelecimento.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>

        {/* Celular */}
        <label className="block mb-4">
          <span className="font-semibold text-gray-700">Celular</span>
          <input
            type="tel"
            name="celular"
            value={estabelecimento.celular}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>

        {/* Endereço */}
        <label className="block mb-4">
          <span className="font-semibold text-gray-700">Endereço</span>
          <input
            type="text"
            name="endereco"
            value={estabelecimento.endereco}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>

        {/* Descrição */}
        <label className="block mb-4">
          <span className="font-semibold text-gray-700">Descrição</span>
          <textarea
            name="descricao"
            value={estabelecimento.descricao}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          />
        </label>

        {/* Upload de Foto */}
        <div className="mb-4">
          <label className="block text-orange-700 font-medium mb-1">Foto do Estabelecimento</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files[0]
              setFoto(file)
              setFotoPreview(URL.createObjectURL(file))
            }}
            className="w-full"
          />
          {fotoPreview && (
            <img
              src={fotoPreview}
              alt="Preview"
              className="mt-2 rounded-lg border shadow w-32 h-32 object-cover"
            />
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/painelestabelecimento')}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className={`px-4 py-2 rounded text-white ${
              salvando ? 'bg-orange-300' : 'bg-orange-600 hover:bg-orange-700'
            } transition`}
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
