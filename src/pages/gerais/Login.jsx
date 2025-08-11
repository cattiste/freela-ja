import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate, Link } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha)
      try { await cred.user.getIdToken(true) } catch {}

      const ref = doc(db, 'usuarios', cred.user.uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        setError('Seu cadastro ainda não foi finalizado. Tente novamente em alguns segundos.')
        setLoading(false)
        return
      }

      const u = snap.data() || {}
      // ✅ Compat: tenta novo, mas prioriza o ANTIGO
      const tipo =
        u.tipo ||
        (u.tipoConta === 'comercial' && u.subtipoComercial) || // 'estabelecimento' | 'pf'
        u.tipoUsuario || // 'freela' em alguns docs
        ''

      const usuarioLocal = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        nome: u.nome || '',
        tipo, // legado continua mandatório
        funcao: u.funcao || '',
        endereco: u.endereco || '',
        foto: u.foto || ''
      }
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLocal))

      const nomeOk = !!usuarioLocal.nome?.trim()

      if (tipo === 'freela') {
        const funcaoOk = !!usuarioLocal.funcao?.trim()
        if (!nomeOk || !funcaoOk) return navigate('/freela/editarfreela')
        return navigate('/painelfreela')
      }
      if (tipo === 'estabelecimento') {
        if (!nomeOk) return navigate('/estabelecimento/editarperfil')
        return navigate('/painelestabelecimento')
      }
      if (tipo === 'pessoa_fisica' || tipo === 'pf') {
        if (!nomeOk) return navigate('/cadastropf')
        return navigate('/pf')
      }

      // fallback: manda pra home
      navigate('/')

    } catch (err) {
      console.error(err)
      const code = err?.code || ''
      if (code === 'auth/invalid-email') setError('E-mail inválido.')
      else if (code === 'auth/user-not-found') setError('Usuário não encontrado.')
      else if (code === 'auth/wrong-password') setError('Senha incorreta.')
      else if (code === 'auth/too-many-requests') setError('Muitas tentativas. Tente novamente mais tarde.')
      else setError('E-mail, senha ou tipo de usuário inválido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-3xl font-bold text-white mb-6 drop-shadow">Entrar na Plataforma</h2>

        <form onSubmit={handleLogin} className="w-full max-w-md bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-4">
          <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required autoComplete="current-password" className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400" />
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition duration-300 disabled:opacity-60">
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        </form>

        <p className="text-center mt-4 text-sm text-white">
          <Link to="/esquecisenha" className="text-blue-200 hover:underline">Esqueci minha senha</Link>
        </p>
      </div>
    </div>
  )
}
