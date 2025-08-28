// src/components/SalvarSenhaCartao.jsx
import React, { useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { toast } from 'react-hot-toast'

export default function SalvarSenhaCartao({ uid }) {
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const salvarSenha = async () => {
    if (!senha || !uid) {
      toast.error('Informe a senha e esteja logado.')
      return
    }

    setLoading(true)
    try {
      const functions = getFunctions()
      const salvarSenhaFn = httpsCallable(functions, 'salvarSenha')
      const res = await salvarSenhaFn({ uid, senha })
      if (res.data.sucesso) {
        toast.success('Senha salva com sucesso!')
        setSenha('')
      } else {
        toast.error('Erro: ' + res.data.erro)
      }
    } catch (err) {
      console.error('Erro ao salvar senha:', err)
      toast.error('Erro ao salvar senha: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-lg font-bold mb-2 text-orange-600">Salvar Senha do Cartão</h2>
      <input
        type="password"
        className="input w-full mb-2"
        placeholder="Senha para pagamento"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <button
        onClick={salvarSenha}
        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        disabled={loading}
      >
        {loading ? 'Salvando...' : 'Salvar Senha'}
      </button>
    </div>
  )
}
