import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

const normalizeTipo = (t) => {
  if (!t) return ''
  let s = String(t).trim().toLowerCase().replace(/\s+/g, '_')
  if (s === 'pessoafisica') s = 'pessoa_fisica'
  return s
}

const destinoPorTipo = {
  freela: '/painelfreela',
  estabelecimento: '/painelestabelecimento',
  pessoa_fisica: '/pf',
  admin: '/painelestabelecimento',
}

export default function Login() {
  const navigate = useNavigate()
  const { usuario, carregando } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  // Se já estiver logado, manda direto pro painel do seu tipo
  useEffect(() => {
    if (carregando) return
    if (usuario?.uid) {
      const tipoNorm = normalizeTipo(usuario?.tipo)
      navigate(destinoPorTipo[tipoNorm] || '/', { replace: true })
    }
  }, [usuario, carregando, navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setBusy(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), senha)
      const uid = cred.user.uid

      // carrega perfil para obter "tipo"
      const snap = await getDoc(doc(db, 'usuarios', uid))
      if (!snap.exists()) {
        // Perfil ainda não criado — manda pra Home como fallback
        navigate('/', { replace: true })
        return
      }
      const perfil = snap.data()
      const tipoNorm = normalizeTipo(perfil?.tipo)

      navigate(destinoPorTipo[tipoNorm] || '/', { replace: true })
    } catch (err) {
      console.error('[Login] erro:', err)
      setErro('E-mail ou senha inválidos. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  if (carregando) {
    return <div className="p-6 text-center text-orange-600">Carregando…</div>
  }

  if (usuario?.uid) {
    // enquanto o useEffect redireciona
    return <div className="p-6 text-center text-green-700">Entrando…</div>
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Entrar</h1>

      {erro && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">
          {erro}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">E-mail</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-60"
        >
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="mt-4 text-sm flex items-center justify-between">
        <Link to="/esquecisenha" className="text-blue-600 hover:underline">
          Esqueci minha senha
        </Link>
        <div className="space-x-2">
          <Link to="/cadastrofreela" className="text-blue-600 hover:underline">Sou Freela</Link>
          <Link to="/cadastroestabelecimento" className="text-blue-600 hover:underline">Sou Estabelecimento</Link>
          <Link to="/cadastropf" className="text-blue-600 hover:underline">Sou Pessoa Física</Link>
        </div>
      </div>
    </div>
  )
}
