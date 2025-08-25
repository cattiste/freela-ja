// src/components/CartaoCreditoForm.jsx
import React, { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import toast from 'react-hot-toast'

export default function CartaoCreditoForm({ uid, onSuccess }) {
  const [numero, setNumero] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [nome, setNome] = useState('')
  const [salvando, setSalvando] = useState(false)

  const salvarCartao = async () => {
    if (!numero || !validade || !cvv || !nome) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      setSalvando(true)
      await setDoc(doc(db, 'cartoes', uid), {
        numero,
        validade,
        cvv,
        nome,
        criadoEm: new Date()
      })
      toast.success('Cartão salvo com sucesso')
      onSuccess()
    } catch (err) {
      console.error('Erro ao salvar cartão:', err)
      toast.error('Erro ao salvar cartão')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-orange-300 shadow mb-4">
      <h3 className="text-lg font-bold text-orange-700 mb-2">💳 Cadastro de Cartão</h3>
      <input
        type="text"
        placeholder="Número do cartão"
        className="input"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Validade (MM/AA)"
          className="input"
          value={validade}
          onChange={(e) => setValidade(e.target.value)}
        />
        <input
          type="text"
          placeholder="CVV"
          className="input"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
        />
      </div>
      <input
        type="text"
        placeholder="Nome impresso no cartão"
        className="input mt-2"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <button
        onClick={salvarCartao}
        className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        disabled={salvando}
      >
        {salvando ? 'Salvando...' : 'Salvar Cartão'}
      </button>
      <p className="text-xs text-gray-500 mt-2">Para sua segurança, não armazenamos os dados do seu cartão de crédito.</p>
    </div>
  )
}
