// CartaoCreditoForm.jsx
import React, { useState } from 'react'
import { db } from '@/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function CartaoCreditoForm({ onClose }) {
  const { usuario } = useAuth()
  const [nome, setNome] = useState('')
  const [numero, setNumero] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [cvv, setCvv] = useState('')
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')

  const salvarCartao = async () => {
    if (!usuario?.uid) return toast.error('Usuário não autenticado.')

    try {
      await setDoc(doc(db, 'pagamentos_usuarios', usuario.uid), {
        nome,
        numero,
        vencimento,
        cvv,
        cpf,
        senhaPagamento: senha
      })
      toast.success('Cartão salvo com sucesso')
      onClose?.()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar cartão')
    }
  }

  return (
    <div className="p-4 space-y-4">
      <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" className="input" />
      <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="Número do cartão" className="input" />
      <input value={vencimento} onChange={e => setVencimento(e.target.value)} placeholder="Validade (MM/AA)" className="input" />
      <input value={cvv} onChange={e => setCvv(e.target.value)} placeholder="CVV" className="input" />
      <input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="CPF" className="input" />
      <input value={senha} onChange={e => setSenha(e.target.value)} placeholder="Senha para pagamento" type="password" className="input" />

      <button onClick={salvarCartao} className="btn btn-primary w-full">Salvar Cartão</button>
    </div>
  )
}
