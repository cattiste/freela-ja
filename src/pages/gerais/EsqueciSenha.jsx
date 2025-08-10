import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!email.trim()) { setMsg('Informe seu e-mail.'); return }
    try {
      setEnviando(true)
      await sendPasswordResetEmail(auth, email.trim(), {
        // opcional: se usar domínio próprio com rota de confirmação:
        // url: 'https://seu-dominio.com/login',
        // handleCodeInApp: false,
      })
      setMsg('Enviamos um link de redefinição para seu e-mail. Confira sua caixa de entrada e o spam.')
    } catch (err) {
      // mensagens amigáveis
      const code = err?.code || ''
      if (code === 'auth/user-not-found') setMsg('Não encontramos conta com este e-mail.')
      else if (code === 'auth/invalid-email') setMsg('E-mail inválido.')
      else setMsg('Não foi possível enviar o e-mail agora. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
      <form onSubmit={submit} className="bg-white w-full max-w-md rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-orange-700 text-center">Recuperar senha</h1>
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="voce@exemplo.com"
            required
          />
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar link de redefinição'}
        </button>
        {msg && <p className="text-sm text-center text-gray-700">{msg}</p>}
      </form>
    </div>
  )
}
