import React, { useRef, useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase'
import { Link } from 'react-router-dom'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const inputRef = useRef(null)

  const submit = async (e) => {
    e.preventDefault()
    if (enviando) return
    setMsg('')
    setErro('')

    const emailNorm = email.trim().toLowerCase()
    if (!emailNorm) {
      setErro('Informe seu e-mail.')
      inputRef.current?.focus()
      return
    }

    try {
      setEnviando(true)
      await sendPasswordResetEmail(auth, emailNorm, {
        // Se tiver domínio/rota próprios, habilite:
        // url: 'https://seu-dominio.com/login',
        // handleCodeInApp: false,
      })
      setMsg('Enviamos um link de redefinição para seu e-mail. Confira a caixa de entrada e o spam.')
    } catch (err) {
      const code = err?.code || ''
      if (code === 'auth/invalid-email') setErro('E-mail inválido.')
      else if (code === 'auth/user-not-found') {
        // Segurança: mantém mensagem neutra (evita revelar se há conta)
        setMsg('Se existir uma conta para este e-mail, você receberá um link de redefinição.')
      } else {
        setErro('Não foi possível enviar o e-mail agora. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-md rounded-2xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-orange-700 text-center">Recuperar senha</h1>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">E-mail</label>
          <input
            id="email"
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="voce@exemplo.com"
            required
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-orange-600 text-white py-2 rounded-xl hover:bg-orange-700 transition disabled:opacity-60"
        >
          {enviando ? 'Enviando...' : 'Enviar link de redefinição'}
        </button>

        {erro && <p className="text-sm text-center text-red-600">{erro}</p>}
        {msg && <p className="text-sm text-center text-gray-700">{msg}</p>}

        <div className="text-center text-sm mt-2">
          <Link to="/login" className="text-orange-600 hover:underline">Voltar ao login</Link>
        </div>
      </form>
    </div>
  )
}
