import React, { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, GeoPoint } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import { auth, db } from '@/firebase'

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dbemvuau3/image/upload'
const UPLOAD_PRESET = 'preset-publico'

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Aceita CNPJ com ou sem máscara (opcional, ajuste conforme necessidade)
function validateCNPJ(cnpj) {
  // Com máscara: 00.000.000/0000-00
  const cnpjMascara = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/
  // Sem máscara: apenas números
  const cnpjLimpo = /^\d{14}$/
  return cnpjMascara.test(cnpj) || cnpjLimpo.test(cnpj.replace(/\D/g, ''))
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
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [localizacaoErro, setLocalizacaoErro] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude)
          setLongitude(pos.coords.longitude)
        },
        () => {
          setLocalizacaoErro('Não foi possível obter a localização automaticamente. Preencha manualmente.')
        }
      )
    }
  }, [])

  useEffect(() => {
    // Limpar URL objeto para evitar vazamento de memória
    return () => {
      if (fotoPreview) URL.revokeObjectURL(fotoPreview)
    }
  }, [fotoPreview])

  const uploadImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Erro no upload da imagem')

      const data = await res.json()
      return data.secure_url
    } catch (err) {
      setError('Falha ao fazer upload da imagem.')
      console.error(err)
      return ''
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setError(null)

    if (!nome || !email || !senha || !celular || !cnpj || !endereco || latitude === null || longitude === null) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    if (!validateEmail(email)) {
      setError('Email inválido.')
      return
    }

    if (!validateCNPJ(cnpj)) {
      setError('CNPJ inválido. Use o formato: 00.000.000/0000-00 ou números limpos.')
      return
    }

    // Evitar NaN ao converter latitude e longitude
    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Latitude e Longitude inválidas.')
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

      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nome,
        email,
        celular,
        cnpj,
        endereco,
        tipo: 'estabelecimento',
        localizacao: new GeoPoint(latitude, longitude),
        foto: fotoUrl,
        criadoEm: serverTimestamp()
      })

      alert('Cadastro realizado com sucesso!')
      navigate('/login')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message || 'Erro ao realizar cadastro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro Estabelecimento</h1>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4" noValidate>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          className="input"
          autoComplete="name"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input"
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          className="input"
          autoComplete="new-password"
        />

        <InputMask
          mask="(99) 99999-9999"
          value={celular}
          onChange={e => setCelular(e.target.value)}
        >
          {(inputProps) => (
            <input
              {...inputProps}
              type="tel"
              placeholder="Celular"
              required
              className="input"
              autoComplete="tel"
            />
          )}
        </InputMask>

        <InputMask
          mask="99.999.999/9999-99"
          value={cnpj}
          onChange={e => setCnpj(e.target.value)}
        >
          {(inputProps) => (
            <input
              {...inputProps}
              type="text"
              placeholder="CNPJ"
              required
              className="input"
              autoComplete="off"
            />
          )}
        </InputMask>

        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          required
          className="input"
          autoComplete="street-address"
        />

        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={latitude !== null ? latitude : ''}
          onChange={e => {
            const val = parseFloat(e.target.value)
            setLatitude(isNaN(val) ? null : val)
          }}
          required
          className="input"
        />

        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={longitude !== null ? longitude : ''}
          onChange={e => {
            const val = parseFloat(e.target.value)
            setLongitude(isNaN(val) ? null : val)
          }}
          required
          className="input"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0]
            setFoto(file)
            if (file) {
              setFotoPreview(URL.createObjectURL(file))
            } else {
              setFotoPreview(null)
            }
          }}
        />

        {fotoPreview && (
          <img
            src={fotoPreview}
            alt="Prévia da Foto"
            className="w-32 h-32 object-cover rounded mt-2"
          />
        )}

        {localizacaoErro && <p className="text-yellow-600">{localizacaoErro}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
