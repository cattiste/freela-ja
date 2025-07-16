// src/pages/estabelecimento/ConfiguracoesEstabelecimento.jsx
import React, { useState, useEffect } from 'react'

export default function ConfiguracoesEstabelecimento({ usuario, config, onSalvar }) {
  const [pix, setPix] = useState('')
  const [banco, setBanco] = useState('')
  const [agencia, setAgencia] = useState('')
  const [conta, setConta] = useState('')

  useEffect(() => {
    if (config) {
      setPix(config.pix || '')
      setBanco(config.banco || '')
      setAgencia(config.agencia || '')
      setConta(config.conta || '')
    }
  }, [config])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSalvar({ pix, banco, agencia, conta })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Chave PIX</label>
        <input
          type="text"
          value={pix}
          onChange={(e) => setPix(e.target.value)}
          className="mt-1 block w-full border rounded p-2"
          placeholder="00000000-00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Banco</label>
        <input
          type="text"
          value={banco}
          onChange={(e) => setBanco(e.target.value)}
          className="mt-1 block w-full border rounded p-2"
          placeholder="Nome do banco"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Agência</label>
          <input
            type="text"
            value={agencia}
            onChange={(e) => setAgencia(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="0000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Conta</label>
          <input
            type="text"
            value={conta}
            onChange={(e) => setConta(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="00000-0"
          />
        </div>
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
      >
        Salvar
      </button>
    </form>
  )
}
