import React, { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, addDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import UploadFoto from '../components/UploadFoto' // seu componente de upload de foto
import './Home.css'

export default function CadastroFreela() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleCadastro = async (e) => {
    e.preventDefault()
    if (!nome || !email || !senha || !celular || !endereco || !funcao) {
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
        nome,
        email,
        celular,
        endereco,
        funcao,
        foto,
        tipo: 'freela'
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
      <h1 className="home-title">Cadastro Freelancer</h1>
      <form onSubmit={handleCadastro} className="form-container">
        <input type="text" placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} className="input" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
        <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} className="input" required />
        <input type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} className="input" required />
        <input type="text" placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} className="input" required />
        <input type="text" placeholder="Função" value={funcao} onChange={e => setFuncao(e.target.value)} className="input" required />

        <label>Foto de Perfil (opcional)</label>
        <UploadFoto onUploadComplete={url => setFoto(url)} />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" className="home-button" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
