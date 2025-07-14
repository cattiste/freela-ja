import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

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
      const docRef = doc(db, 'usuarios', user.uid)
      const docSnap = await getDoc(docRef)

      let dadosUsuario = {}

      if (docSnap.exists()) {
        dadosUsuario = docSnap.data()
      } else {
        // Cria um novo perfil básico
        dadosUsuario = {
          nome: user.displayName || '',
          tipo: '',
          funcao: '',
          endereco: '',
          foto: user.photoURL || '',
          celular: '',
          valorDiaria: '',
          email: user.email,
          criadoEm: new Date()
        }

        await setDoc(docRef, dadosUsuario)
        console.warn('⚠️ Perfil criado automaticamente no Firestore.')
      }

      const usuarioLocal = {
        uid: user.uid,
        email: user.email,
        nome: dadosUsuario.nome,
        tipo: dadosUsuario.tipo,
        funcao: dadosUsuario.funcao || '',
        endereco: dadosUsuario.endereco || '',
        foto: dadosUsuario.foto || ''
      }

      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLocal))

      // Verifica se o perfil está incompleto
      const perfilIncompleto = !dadosUsuario.tipo || !dadosUsuario.nome || !dadosUsuario.funcao

      if (perfilIncompleto) {
        if (dadosUsuario.tipo === 'freela') {
          navigate('/editarperfilfreela')
        } else if (dadosUsuario.tipo === 'estabelecimento') {
          navigate('/editarperfilestabelecimento')
        } else {
          navigate('/escolher-tipo-usuario') // ou redirecione para uma tela genérica
        }
        return
      }

      // Redireciona com base no tipo
      if (dadosUsuario.tipo === 'freela') {
        navigate('/painelfreela')
      } else if (dadosUsuario.tipo === 'estabelecimento') {
        navigate('/painel-estabelecimento')
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
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex justify-between max-w-md w-full px-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded px-4 py-2 shadow"
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 shadow"
        >
          🏠 Home
        </button>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 p-6">
        <h2 className="text-3xl font-bold text-orange-600 mb-6">Entrar na Plataforma</h2>

        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-4 bg-white p-6 rounded-2xl shadow-lg"
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

        <p className="text-center mt-4 text-sm">
          <a href="/esquecisenha" className="text-blue-600 hover:underline">
            Esqueci minha senha
          </a>
        </p>
      </div>
    </>
  )
}
