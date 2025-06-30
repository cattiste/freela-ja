import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import UploadImagem from '../components/UploadImagem'

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [especialidades, setEspecialidades] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`)
      const data = await res.json()
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        }
      }
    } catch (err) {
      console.error('Erro ao geolocalizar endereço:', err)
    }
    return null
  }

  const handleCadastro = async (e) => {
    e.preventDefault()

    if (!nome || !email || !senha || !celular || !endereco || !funcao || !valorDiaria || !especialidades) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const coords = await geolocalizarEndereco(endereco)

      if (!coords) {
        alert('Endereço inválido. Tente outro ou revise o texto.')
        setLoading(false)
        return
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
        foto,
        tipo: 'freela',
        criadoEm: new Date(),
        lat: coords.lat,
        lon: coords.lon,
        valorDiaria: parseFloat(valorDiaria)
      })

      alert('Cadastro realizado com sucesso!')
      navigate('/painelfreela')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro Freelancer</h1>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="tel"
          placeholder="Celular"
          value={celular}
          onChange={e => setCelular(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={e => setFuncao(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="text"
          placeholder="Especialidades"
          value={especialidades}
          onChange={e => setEspecialidades(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        <input
          type="number"
          placeholder="Valor da Diária (ex: 150)"
          value={valorDiaria}
          onChange={e => setValorDiaria(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />

        {/* Upload de imagem */}
        <UploadImagem onUploadComplete={url => setFoto(url)} />

        {/* Erro */}
        {error && (
          <p className="text-red-600 text-center text-sm">{error}</p>
        )}

        {/* Botão */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white font-semibold py-3 rounded-xl transition duration-300 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
