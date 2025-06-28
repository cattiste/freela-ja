import React, { useState } from 'react'
<<<<<<< HEAD
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import UploadImagem from '../components/UploadImagem'
import './Home.css'
=======
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import InputMask from 'react-input-mask'
import { auth, db } from '@/firebase'

function validateEmail(email) {
  // Regex simples para validar email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateCNPJ(cnpj) {
  // Validação básica (apenas formato: 00.000.000/0000-00)
  return /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(cnpj)
}
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

export default function CadastroEstabelecimento() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
<<<<<<< HEAD
  const [endereco, setEndereco] = useState('')
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`
      )
      const data = await response.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (err) {
      console.error('Erro ao geolocalizar:', err)
    }
    return null
  }

  const handleCadastro = async (e) => {
    e.preventDefault()

    if (!nome || !email || !senha || !celular || !endereco) {
      alert('Preencha todos os campos obrigatórios.')
=======
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')
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
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      return
    }

    setLoading(true)
<<<<<<< HEAD
    setError(null)
=======
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

<<<<<<< HEAD
      const coordenadas = await geolocalizarEndereco(endereco)

      await addDoc(collection(db, 'usuarios'), {
=======
      await setDoc(doc(db, 'usuarios', user.uid), {
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
        uid: user.uid,
        nome,
        email,
        celular,
<<<<<<< HEAD
        endereco,
        foto,
        tipo: 'estabelecimento',
        coordenadas,
        criadoEm: new Date()
=======
        cnpj,
        endereco,
        tipo: 'estabelecimento',
        criadoEm: serverTimestamp()
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
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
<<<<<<< HEAD
    <div className="home-container">
      <h1 className="home-title">Cadastro de Estabelecimento</h1>
      <form onSubmit={handleCadastro} className="form-container">
        <input type="text" placeholder="Nome do Estabelecimento" value={nome} onChange={e => setNome(e.target.value)} className="input" />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input" />
        <input type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="input" />
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input" />

        <UploadImagem onUploadComplete={url => setFoto(url)} />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" className="home-button" disabled={loading}>
=======
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
