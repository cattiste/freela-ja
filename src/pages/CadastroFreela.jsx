import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, GeoPoint } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import { auth, db } from '@/firebase'

// Se usar upload de imagem, implemente aqui ou importe seu componente
async function uploadImage(file) {
  // Implemente seu upload (ex: Cloudinary) e retorne URL da imagem
  return ''
}

function validateCPF(cpf) {
  return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf)
}

// Exemplo simples de geocoding com Google Maps API (precisa API key e lib axios ou fetch)
async function geolocalizarEndereco(endereco) {
  const API_KEY = 'SUA_GOOGLE_MAPS_API_KEY'
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(endereco)}&key=${API_KEY}`

  const resp = await fetch(url)
  const data = await resp.json()
  if (data.status === 'OK') {
    const location = data.results[0].geometry.location
    return { lat: location.lat, lon: location.lng }
  }
  return null
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

  async function handleCadastro(e) {
    e.preventDefault()
    setError(null)

    if (!nome || !email || !senha || !celular || !endereco || !funcao || !especialidades || !valorDiaria || !cpf) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    if (!validateCPF(cpf)) {
      setError('CPF inválido. Formato esperado: 000.000.000-00')
      return
    }

    setLoading(true)

    try {
      const coords = await geolocalizarEndereco(endereco)
      if (!coords) {
        setError('Endereço inválido ou não encontrado.')
        setLoading(false)
        return
      }

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
        endereco,
        funcao,
        especialidades,
        valorDiaria: parseFloat(valorDiaria),
        cpf,
        tipo: 'freela',
        foto: fotoUrl,
        criadoEm: new Date(),
        localizacao: new GeoPoint(coords.lat, coords.lon)
      })

      alert('Cadastro realizado com sucesso!')
      navigate('/painelfreela')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro Freelancer</h1>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4" noValidate>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
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
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}
        </InputMask>
        <InputMask
          mask="999.999.999-99"
          value={cpf}
          onChange={e => setCpf(e.target.value)}
        >
          {(inputProps) => (
            <input
              {...inputProps}
              type="text"
              placeholder="CPF"
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          )}
        </InputMask>
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={e => setFuncao(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="text"
          placeholder="Especialidades"
          value={especialidades}
          onChange={e => setEspecialidades(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="number"
          placeholder="Valor da diária"
          value={valorDiaria}
          onChange={e => setValorDiaria(e.target.value)}
          required
          min="0"
          step="0.01"
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <div>
          <label className="block text-orange-700 font-medium mb-1">Foto (opcional):</label>
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

        {error && <p className="text-red-600 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white font-semibold rounded-xl transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
