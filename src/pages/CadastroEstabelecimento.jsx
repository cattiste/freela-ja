import React, { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import UploadFoto from '../components/UploadFoto' // seu componente de upload de foto
import './Home.css'

export default function CadastroEstabelecimento() {
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [descricao, setDescricao] = useState('')
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleCadastro = async (e) => {
    e.preventDefault()
    if (!nomeFantasia || !email || !senha || !telefone || !endereco || !descricao) {
      alert('Preencha todos os campos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      // Salva dados extras no Firestore, incluindo uid do usuário criado
      await addDoc(collection(db, 'usuarios'), {
        uid: user.uid,
        nomeFantasia,
        email,
        telefone,
        endereco,
        descricao,
        foto,
        tipo: 'estabelecimento'
      })

      alert('Cadastro realizado com sucesso! Faça login para continuar.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Cadastro Estabelecimento</h1>
      <form onSubmit={handleCadastro} className="form-container">
        <input type="text" placeholder="Nome Fantasia" value={nomeFantasia} onChange={e => setNomeFantasia(e.target.value)} className="input" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input" required />
        <input type="text" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} className="input" required />
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input" required />
        <textarea placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className="input" rows={4} required />
        
        <label>Foto do Estabelecimento (opcional)</label>
        <UploadFoto onUploadComplete={url => setFoto(url)} />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" className="home-button" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
