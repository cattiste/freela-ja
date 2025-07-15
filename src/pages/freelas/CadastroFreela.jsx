// CadastroFreela.jsx
import React, { useState } from 'react'
import { import { createUserWithEmailAndPassword } from 'firebase/auth' } from 'firebase/auth'
import { doc, setDoc, GeoPoint, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import { auth, db } from '@/firebase'

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dbemvuau3/image/upload'
const UPLOAD_PRESET = 'preset-publico'

function validateCPF(cpf) {
  return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf)
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

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [especialidades, setEspecialidades] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [cpf, setCpf] = useState('')
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleCadastro = async (e) => {
    e.preventDefault()
    setError(null)

    if (!nome || !email || !senha || !celular || !endereco || !funcao || !especialidades || !valorDiaria || !cpf) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    if (!validateCPF(cpf)) {
      setError('CPF inválido.')
      return
    }

    setLoading(true)

    try {
      let fotoUrl = ''
      if (foto) {
        fotoUrl = await uploadImage(foto)
      }

      const usuarioCredential = await import { createUserWithEmailAndPassword } from 'firebase/auth'(auth, email, senha)
      const usuario = usuarioCredential.usuario

      // Dummy coordinates (ou usar geolocalização real depois)
      const geo = new GeoPoint(-23.55052, -46.633308) // SP default

      await setDoc(doc(db, 'usuarios', usuario.uid), {
        uid: usuario.uid,
        nome,
        email,
        celular,
        endereco,
        funcao,
        especialidades,
        valorDiaria: parseFloat(valorDiaria),
        cpf,
        tipo: 'freela',
        foto: fotoUrl,
        criadoEm: serverTimestamp(),
        localizacao: geo
      })

      alert('Cadastro realizado com sucesso!')
      navigate('/painelfreela')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      if (auth.currentusuario) await auth.currentusuario.delete()
      setError(err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro Freelancer</h1>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4" noValidate>
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="input" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input" required />
        <InputMask mask="(99) 99999-9999" value={celular} onChange={e => setCelular(e.target.value)}>
          {(inputProps) => <input {...inputProps} type="tel" placeholder="Celular" className="input" required />}
        </InputMask>
        <InputMask mask="999.999.999-99" value={cpf} onChange={e => setCpf(e.target.value)}>
          {(inputProps) => <input {...inputProps} type="text" placeholder="CPF" className="input" required />}
        </InputMask>
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input" required />
        <input type="text" placeholder="Função" value={funcao} onChange={e => setFuncao(e.target.value)} className="input" required />
        <input type="text" placeholder="Especialidades" value={especialidades} onChange={e => setEspecialidades(e.target.value)} className="input" required />
        <input type="number" placeholder="Valor da diária" value={valorDiaria} onChange={e => setValorDiaria(e.target.value)} className="input" required />

        <input type="file" accept="image/*" onChange={e => {
          const file = e.target.files[0]
          setFoto(file)
          setFotoPreview(URL.createObjectURL(file))
        }} />

        {fotoPreview && <img src={fotoPreview} alt="Preview" className="w-32 h-32 rounded-lg object-cover" />}
        {error && <p className="text-red-600 text-center">{error}</p>}

        <button type="submit" disabled={loading} className="bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
