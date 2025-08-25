// src/components/CartaoCreditoForm.jsx
import React, { useState } from 'react'
import toast from 'react-hot-toast'

export default function CartaoCreditoForm({ uid }) {
  const [form, setForm] = useState({
    numero: '',
    validade: '',
    cvv: '',
    nome: '',
    cpf: '',
  })
  const [mostrar, setMostrar] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setCarregando(true)
    try {
      const resposta = await fetch('http://localhost:8080/cadastrarCartao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, ...form }),
      })
      const json = await resposta.json()
      if (!json.sucesso) throw new Error(json.erro)

      toast.success('✅ Cartão salvo com sucesso!')
      setMostrar(false)
    } catch (err) {
      toast.error(`Erro: ${err.message}`)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mb-6">
      {!mostrar ? (
        <button
          onClick={() => setMostrar(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-bold w-full"
        >
          💳 Cadastrar Cartão de Crédito
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-4 border border-orange-200"
        >
          <h2 className="text-lg font-bold mb-3 text-orange-700">💳 Cadastro de Cartão</h2>

          <div className="space-y-3">
            <input
              type="text"
              name="numero"
              placeholder="Número do Cartão"
              maxLength={19}
              value={form.numero}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="validade"
              placeholder="Validade (MM/AA)"
              value={form.validade}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              maxLength={4}
              value={form.cvv}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="nome"
              placeholder="Nome Impresso no Cartão"
              value={form.nome}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="cpf"
              placeholder="CPF do Titular"
              value={form.cpf}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            🔒 Para sua segurança, <strong>não armazenamos</strong> os dados de seu cartão de crédito.
          </p>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold"
            >
              {carregando ? 'Salvando...' : 'Salvar Cartão'}
            </button>
            <button
              type="button"
              onClick={() => setMostrar(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded font-bold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
