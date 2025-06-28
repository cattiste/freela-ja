<<<<<<< HEAD
// src/pages/CadastroFreela.jsx
import React, { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import UploadImagem from '../components/UploadImagem'
import './Home.css'
=======
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import UploadImagem from '../components/UploadImagem'
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
<<<<<<< HEAD
=======
  const [especialidades, setEspecialidades] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

<<<<<<< HEAD
  const handleCadastro = async (e) => {
    e.preventDefault()

    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
=======
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
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      alert('Preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)
    setError(null)

    try {
<<<<<<< HEAD
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      // Aqui usamos setDoc com UID como ID do documento
=======
      const coords = await geolocalizarEndereco(endereco)

      if (!coords) {
        alert('Endereço inválido. Tente outro ou revise o texto.')
        setLoading(false)
        return
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      await setDoc(doc(db, 'usuarios', user.uid), {
        uid: user.uid,
        nome,
        email,
        celular,
        endereco,
        funcao,
<<<<<<< HEAD
        foto,
        tipo: 'freela',
        criadoEm: new Date()
      })

      alert('Cadastro realizado com sucesso!')
      navigate('/login')
=======
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
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <div className="home-container">
      <h1 className="home-title">Cadastro Freelancer</h1>
      <form onSubmit={handleCadastro} className="form-container">
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="input" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input" />
        <input type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="input" />
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input" />
        <input type="text" placeholder="Função" value={funcao} onChange={e => setFuncao(e.target.value)} className="input" />

        <UploadImagem onUploadComplete={url => setFoto(url)} />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" className="home-button" disabled={loading}>
=======
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Cadastro Freelancer</h1>

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
        <input
          type="text"
          placeholder="Celular"
          value={celular}
          onChange={e => setCelular(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={e => setFuncao(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Especialidades"
          value={especialidades}
          onChange={e => setEspecialidades(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="number"
          placeholder="Valor da Diária (ex: 150)"
          value={valorDiaria}
          onChange={e => setValorDiaria(e.target.value)}
          className="input-field"
          required
        />

        <UploadImagem onUploadComplete={url => setFoto(url)} />

        {error && <p className="text-red-600 text-center mt-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-4"
        >
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
