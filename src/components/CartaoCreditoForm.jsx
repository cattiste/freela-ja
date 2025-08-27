// CartaoCreditoForm.jsx
import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/firebase'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import axios from 'axios'

export default function CartaoCreditoForm() {
  const { usuario } = useAuth()
  const [numero, setNumero] = useState('')
  const [nome, setNome] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const [mes, ano] = validade.split('/')
      const body = {
        brand: 'visa', // ou 'mastercard'
        number: numero,
        expiration_month: mes.trim(),
        expiration_year: '20' + ano.trim(),
        cvv: cvv.trim(),
        holder: {
          name: nome,
        },
      }

      // Gera token de pagamento com a API da Gerencianet
      const res = await axios.post('https://api-pix.gerencianet.com.br/v1/tokenize-card', body, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GN_API_TOKEN}`, // ou direto do backend com segurança
        }
      })

      const payment_token = res.data.payment_token
      const ultimos4 = numero.slice(-4)

      // Salva o cartão no Firestore
      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        cartoes: arrayUnion({
          payment_token,
          ultimos4,
          nomeTitular: nome
        })
      })

      alert('Cartão salvo com sucesso!')
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar cartão. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input value={numero} onChange={e => setNumero(e.target.value)} placeholder="Número do cartão" required />
      <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do titular" required />
      <input value={validade} onChange={e => setValidade(e.target.value)} placeholder="Validade (MM/AA)" required />
      <input value={cvv} onChange={e => setCvv(e.target.value)} placeholder="CVV" required />

      <button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Cartão'}
      </button>
    </form>
  )
}
