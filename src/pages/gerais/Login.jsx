import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

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
      const usuario = credenciais.user
      const docRef = doc(db, 'usuarios', usuario.uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        setError('Seu cadastro ainda não foi finalizado. Tente novamente em alguns segundos.')
        setLoading(false)
        return
      }

      const dadosUsuario = docSnap.data()

      const usuarioLocal = {
        uid: usuario.uid,
        email: usuario.email,
        nome: dadosUsuario.nome,
        tipo: dadosUsuario.tipo,
        funcao: dadosUsuario.funcao || '',
        endereco: dadosUsuario.endereco || '',
        foto: dadosUsuario.foto || ''
      }

      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLocal))

      const perfilIncompleto = !dadosUsuario.nome || !dadosUsuario.funcao
      if (dadosUsuario.tipo === 'freela' && perfilIncompleto) {
        navigate('/editarperfilfreela')
        return
      }

      if (dadosUsuario.tipo === 'freela') {
        navigate('/painelfreela')
      } else if (dadosUsuario.tipo === 'estabelecimento') {
        navigate('/painelestabelecimento')
      } else if (dadosUsuario.tipo === 'pessoa_fisica') {
        navigate('/pf')
      } else {
        throw new Error('Tipo de usuário não reconhecido.')
      }

    } catch (err) {
      console.error(err)
      setError('E-mail, senha ou tipo de usuário inválido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-3xl font-bold text-white mb-6 drop-shadow">Entrar na Plataforma</h2>

        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-4"
        >
          <input
            type="email"
            placeholder="E-mail"
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

        <p className="text-center mt-4 text-sm text-white">
          <a href="/esquecisenha" className="text-blue-200 hover:underline">
            Esqueci minha senha
          </a>
        </p>
      </div>
    </div>
  )
}
