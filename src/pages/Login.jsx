import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'

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

      const q = query(collection(db, 'usuarios'), where('uid', '==', user.uid))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        throw new Error('Usuário autenticado, mas não encontrado na base de dados.')
      }

      const dadosUsuario = snapshot.docs[0].data()

      localStorage.setItem('usuarioLogado', JSON.stringify({
        uid: user.uid,
        email: user.email,
        nome: dadosUsuario.nome,
        tipo: dadosUsuario.tipo,
        funcao: dadosUsuario.funcao || '',
        endereco: dadosUsuario.endereco || '',
        foto: dadosUsuario.foto || '',
      }))

      const todosUsuarios = []
      snapshot.forEach(doc => todosUsuarios.push(doc.data()))
      localStorage.setItem('usuarios', JSON.stringify(todosUsuarios))

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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 p-6">
      <h2 className="text-3xl font-bold text-orange-600 mb-6">Entrar na Plataforma</h2>
      
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 bg-white p-6 rounded-xl shadow-md">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          className="input-field"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      </form>

        <p className="text-center mt-4 text-sm">
         <a href="/esquecisenha" className="text-blue-600 hover:underline">
            Esqueci minha senha
         </a>
       </p>
    </div>
  )
}
