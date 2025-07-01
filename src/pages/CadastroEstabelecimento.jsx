import React, { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import { auth, db } from '@/firebase'

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/seu-cloud-name/image/upload'
const UPLOAD_PRESET = 'preset-publico'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateCNPJ(cnpj) {
  return /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(cnpj)
}

export default function CadastroEstabelecimento() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [localizacaoErro, setLocalizacaoErro] = useState(null)
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude)
          setLongitude(pos.coords.longitude)
          setLocalizacaoErro(null)
        },
        (err) => {
          console.warn('Permissão para localização negada ou erro:', err)
          setLocalizacaoErro('Não foi possível obter localização automática.')
        }
      )
    } else {
      setLocalizacaoErro('Geolocalização não suportada pelo navegador.')
    }
  }, [])

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    })

    const data = await response.json()
    return data.secure_url
  }

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
    if (latitude === null || longitude === null) {
      setError('Permita acesso à localização ou preencha latitude/longitude.')
      return
    }

    setLoading(true)

    try {
      let fotoUrl = ''
      if (foto) {
        fotoUrl = await uploadImage(foto)
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      const userData = {
        uid: user.uid,
        nome,
        email,
        celular,
        cnpj,
        endereco,
        tipo: 'estabelecimento',
        localizacao: { latitude, longitude },
        criadoEm: serverTimestamp()
      }

      if (fotoUrl) {
        userData.foto = fotoUrl
      }

      await setDoc(doc(db, 'usuarios', user.uid), userData)

      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro Estabelecimento</h1>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4">
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} required className="input" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required className="input" />

        <InputMask mask="(99) 99999-9999" value={celular} onChange={e => setCelular(e.target.value)}>
          {(inputProps) => <input {...inputProps} type="tel" placeholder="Celular" className="input" required />}
        </InputMask>

        <InputMask mask="99.999.999/9999-99" value={cnpj} onChange={e => setCnpj(e.target.value)}>
          {(inputProps) => <input {...inputProps} type="text" placeholder="CNPJ" className="input" required />}
        </InputMask>

        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} required className="input" />

        <input type="number" step="any" value={latitude || ''} onChange={e => setLatitude(parseFloat(e.target.value))} placeholder="Latitude" required className="input" />
        <input type="number" step="any" value={longitude || ''} onChange={e => setLongitude(parseFloat(e.target.value))} placeholder="Longitude" required className="input" />

        <input type="file" accept="image/*" onChange={(e) => {
          const file = e.target.files[0]
          setFoto(file)
          setFotoPreview(URL.createObjectURL(file))
        }} />

        {fotoPreview && <img src={fotoPreview} alt="Preview" className="mt-2 rounded-lg border shadow w-32 h-32 object-cover" />}

        {localizacaoErro && <p className="text-yellow-600 text-sm">{localizacaoErro}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600">
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
