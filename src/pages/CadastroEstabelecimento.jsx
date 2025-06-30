import React, { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import { auth, db } from '@/firebase'

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
          setLocalizacaoErro('Não foi possível obter localização automática. Você pode preencher manualmente.')
        }
      )
    } else {
      setLocalizacaoErro('Geolocalização não suportada pelo navegador.')
    }
  }, [])

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
      setError('Por favor, permita acesso à localização ou preencha os campos de latitude e longitude.')
      return
    }

    setLoading(true)

    try {
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
        localizacao: {
          latitude,
          longitude
        },
        criadoEm: serverTimestamp()
      })

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
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro Estabelecimento</h1>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="input-field"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="input-field"
          required
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
              className="input-field"
              required
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
              className="input-field"
              required
            />
          )}
        </InputMask>

        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          className="input-field"
          required
        />

        {/* Mostrar latitude e longitude (pode ser editável caso queira permitir ajuste manual) */}
        <div>
          <label className="block text-orange-700 font-medium mb-1">Latitude (auto ou manual):</label>
          <input
            type="number"
            step="any"
            value={latitude || ''}
            onChange={e => setLatitude(parseFloat(e.target.value))}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-orange-700 font-medium mb-1">Longitude (auto ou manual):</label>
          <input
            type="number"
            step="any"
            value={longitude || ''}
            onChange={e => setLongitude(parseFloat(e.target.value))}
            className="input-field"
            required
          />
        </div>

        {localizacaoErro && (
          <p className="text-yellow-600 text-center text-sm">{localizacaoErro}</p>
        )}

        {error && <p className="text-red-600 text-center mt-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-4"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
