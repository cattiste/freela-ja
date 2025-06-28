<<<<<<< HEAD
// src/pages/Login.jsx
import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../firebase'
import './Home.css'
=======
import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const credenciais = await signInWithEmailAndPassword(auth, email, senha)
      const user = credenciais.user

<<<<<<< HEAD
      // Buscar no Firestore os dados do usuário
      const q = query(collection(db, 'usuarios'), where('uid', '==', user.uid))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        throw new Error('Usuário autenticado, mas não encontrado na base de dados.')
      }

      const dadosUsuario = snapshot.docs[0].data()
=======
      const docRef = doc(db, 'usuarios', user.uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('Usuário autenticado, mas não encontrado na base de dados.')
      }

      const dadosUsuario = docSnap.data()
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

      localStorage.setItem('usuarioLogado', JSON.stringify({
        uid: user.uid,
        email: user.email,
        nome: dadosUsuario.nome,
        tipo: dadosUsuario.tipo,
        funcao: dadosUsuario.funcao || '',
        endereco: dadosUsuario.endereco || '',
        foto: dadosUsuario.foto || '',
      }))

<<<<<<< HEAD
      // Salva todos no localStorage (opcional para uso offline/local)
      const todosUsuarios = []
      snapshot.forEach(doc => todosUsuarios.push(doc.data()))
      localStorage.setItem('usuarios', JSON.stringify(todosUsuarios))

      // Redireciona
      if (dadosUsuario.tipo === 'freela') {
        navigate('/painelfreela')
      } else if (dadosUsuario.tipo === 'estabelecimento') {
        navigate('/painel-estabelecimento')
      } else {
        throw new Error('Tipo de usuário não reconhecido.')
      }
    } catch (err) {
      console.error(err)
      setError('E-mail, senha ou cadastro inválido.')
=======
      if (dadosUsuario.tipo === 'freela') {
        navigate('/painelfreela')
      } else if (dadosUsuario.tipo === 'estabelecimento') {
        navigate('/painel-estabelecimento') // ✅ CORRIGIDO
      } else {
        throw new Error('Tipo de usuário não reconhecido.')
      }

    } catch (err) {
      console.error(err)
      setError('E-mail, senha ou tipo de usuário inválido.')
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    } finally {
      setLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <div className="home-container">
      <h2 className="home-title">Entrar na Plataforma</h2>
      <form onSubmit={handleLogin} className="form-container">
=======
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 p-6">
      <h2 className="text-3xl font-bold text-orange-600 mb-6">Entrar na Plataforma</h2>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-4 bg-white p-6 rounded-2xl shadow-lg"
      >
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
<<<<<<< HEAD
          className="input"
=======
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
<<<<<<< HEAD
          className="input"
        />
        <button type="submit" disabled={loading} className="home-button">
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
      {error && <p className="error-text">{error}</p>}
=======
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition duration-300"
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
      </form>

      <p className="text-center mt-4 text-sm">
        <a href="/esquecisenha" className="text-blue-600 hover:underline">
          Esqueci minha senha
        </a>
      </p>
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    </div>
  )
}
