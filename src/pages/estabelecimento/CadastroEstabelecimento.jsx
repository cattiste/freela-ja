// 📄 src/pages/CadastroEstabelecimento.jsx
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, GeoPoint, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import { auth, db } from '@/firebase'

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dbemvuau3/image/upload'
const UPLOAD_PRESET = 'preset-publico'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateCNPJ(cnpj) {
  return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj)
}

async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const response = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData })
  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error?.message || 'Falha no upload da imagem.')
  }
  const data = await response.json()
  return data.secure_url
}

export default function CadastroEstabelecimento() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const handleCadastro = async (e) => {
    e.preventDefault()
    setError(null)

    if (!nome || !email || !senha || !celular || !cnpj || !endereco) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    if (!validateEmail(email)) {
      setError('Email inválido.')
      return
    }
    if (!validateCNPJ(cnpj)) {
      setError('CNPJ inválido. Formato esperado: 00.000.000/0000-00')
      return
    }

    setLoading(true)

    try {
      let fotoUrl = ''
      if (foto) {
        fotoUrl = await uploadImage(foto)
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const usuario = userCredential.usuario

      const geo = new GeoPoint(-23.55052, -46.633308) // Posição padrão SP

      const usuarioData = {
        uid: usuario.uid,
        nome,
        email,
        celular,
        cnpj,
        endereco,
        tipo: 'estabelecimento',
        localizacao: geo,
        criadoEm: serverTimestamp(),
        ...(fotoUrl && { foto: fotoUrl })
      }

      await setDoc(doc(db, 'usuarios', usuario.uid), usuarioData)

      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-2xl shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro Estabelecimento</h1>

          <form onSubmit={handleCadastro} className="flex flex-col gap-4">
            <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="input-field" required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
            <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input-field" required />

            <InputMask mask="(99) 99999-9999" value={celular} onChange={e => setCelular(e.target.value)}>
              {(inputProps) => <input {...inputProps} type="tel" placeholder="Celular" className="input-field" required />}
            </InputMask>

            <InputMask mask="99.999.999/9999-99" value={cnpj} onChange={e => setCnpj(e.target.value)}>
              {(inputProps) => <input {...inputProps} type="text" placeholder="CNPJ" className="input-field" required />}
            </InputMask>

            <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input-field" required />

            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0]
              setFoto(file)
              setFotoPreview(URL.createObjectURL(file))
            }} />

            {fotoPreview && <img src={fotoPreview} alt="Preview" className="mt-2 rounded-lg border shadow w-32 h-32 object-cover mx-auto" />}

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}