import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, GeoPoint } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function CadastroPessoaFisica() {
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [coordenadas, setCoordenadas] = useState({ lat: null, lon: null })
  const [carregando, setCarregando] = useState(false)

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`
      )
      const data = await response.json()
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao geolocalizar endereço:', error)
      return null
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault()
    setCarregando(true)

    try {
      const coords = await geolocalizarEndereco(endereco)
      if (!coords) throw new Error('Endereço não encontrado.')

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nome,
        email,
        celular,
        endereco,
        tipo: 'pessoa_fisica',
        localizacao: new GeoPoint(coords.lat, coords.lon),
        criadoEm: serverTimestamp()
      })

      toast.success('Cadastro realizado com sucesso!')
      navigate('/painelpf')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao cadastrar: ' + error.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow border space-y-4">
      <h2 className="text-xl font-bold text-orange-600 text-center">Cadastro Pessoa Física</h2>
      <form onSubmit={handleCadastro} className="space-y-4">
        <input
          type="text"
          placeholder="Nome completo"
          className="w-full p-2 border rounded"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 border rounded"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Celular"
          className="w-full p-2 border rounded"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
        />
        <input
          type="text"
          placeholder="Endereço (completo)"
          className="w-full p-2 border rounded"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
          disabled={carregando}
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
