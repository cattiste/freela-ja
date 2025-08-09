import React, { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { Loader2, MailCheck, AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [emailVerified, setEmailVerified] = useState(true)
  const [showResendVerification, setShowResendVerification] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpa erros quando o usuário digita
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      setError('Por favor, insira um e-mail válido')
      return false
    }
    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return false
    }
    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    setError(null)
    setShowResendVerification(false)

    try {
      const credenciais = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.senha
      )
      
      const usuario = credenciais.user
      
      // Verificação de e-mail
      if (!usuario.emailVerified) {
        setError('Seu e-mail ainda não foi verificado')
        setEmailVerified(false)
        setShowResendVerification(true)
        await auth.signOut()
        setLoading(false)
        return
      }

      // Busca dados adicionais no Firestore
      const docRef = doc(db, 'usuarios', usuario.uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        setError('Cadastro não encontrado. Complete seu registro.')
        await auth.signOut()
        setLoading(false)
        return
      }

      const dadosUsuario = docSnap.data()

      // Verificação do tipo de usuário
      if (!dadosUsuario.tipo) {
        setError('Tipo de usuário não definido')
        setLoading(false)
        return
      }

      // Formata os dados do usuário para o contexto
      const userData = {
        uid: usuario.uid,
        email: usuario.email,
        emailVerified: usuario.emailVerified,
        nome: dadosUsuario.nome || '',
        tipo: dadosUsuario.tipo,
        foto: dadosUsuario.foto || '',
        // outros campos necessários
      }

      // Atualiza o contexto de autenticação
      setUser(userData)
      
      // Armazena no localStorage (opcional)
      localStorage.setItem('usuarioLogado', JSON.stringify(userData))

      // Redirecionamento baseado no tipo de usuário
      redirectUser(dadosUsuario.tipo)

    } catch (err) {
      handleLoginError(err)
    } finally {
      setLoading(false)
    }
  }

  const redirectUser = (userType) => {
    switch(userType.toLowerCase()) {
      case 'freela':
      case 'freelancer':
        navigate('/painelfreela')
        break
      case 'estabelecimento':
      case 'empresa':
        navigate('/painelestabelecimento')
        break
      case 'pessoa_fisica':
      case 'pf':
        navigate('/pf')
        break
      default:
        setError('Tipo de usuário não reconhecido')
    }
  }

  const handleLoginError = (error) => {
    console.error('Erro no login:', error)
    
    switch(error.code) {
      case 'auth/user-not-found':
        setError('Usuário não encontrado')
        break
      case 'auth/wrong-password':
        setError('Senha incorreta')
        break
      case 'auth/too-many-requests':
        setError('Muitas tentativas. Tente novamente mais tarde')
        break
      case 'auth/user-disabled':
        setError('Esta conta foi desativada')
        break
      default:
        setError('Erro ao fazer login. Tente novamente')
    }
  }

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser)
      setError('E-mail de verificação reenviado. Verifique sua caixa de entrada.')
      setShowResendVerification(false)
    } catch (err) {
      setError('Erro ao reenviar e-mail de verificação')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-orange-600 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Acesse sua conta</h1>
          <p className="text-orange-100 mt-1">Entre para gerenciar seus eventos</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              required
              minLength="6"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="••••••"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Lembrar de mim
              </label>
            </div>
            
            <a href="/esquecisenha" className="text-sm text-orange-600 hover:text-orange-500">
              Esqueceu a senha?
            </a>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {showResendVerification && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-500"
            >
              <MailCheck className="w-4 h-4" />
              Reenviar e-mail de verificação
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Carregando...
              </>
            ) : 'Entrar'}
          </button>
        </form>
        
        <div className="px-6 py-4 bg-gray-50 text-center border-t">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <a href="/cadastropf" className="font-medium text-orange-600 hover:text-orange-500">
              Cadastre-se como Pessoa Física
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}