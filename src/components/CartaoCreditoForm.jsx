import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getApp } from 'firebase/app'

export default function CartaoCreditoForm({ onClose }) {
  const { usuario } = useAuth()

  const [numero, setNumero] = useState('')
  const [nome, setNome] = useState('')
  const [mes, setMes] = useState('')
  const [ano, setAno] = useState('')
  const [cvv, setCvv] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)

    try {
      const functions = getFunctions(getApp())
      const salvarCartao = httpsCallable(functions, 'salvarCartao')

      const resultado = await salvarCartao({
        uid: usuario.uid,
        numeroCartao: numero.replace(/\s/g, ''),
        nomeTitular: nome.trim(),
        validade: `${mes.trim()}/${ano.trim()}`,
        cvv: cvv.trim(),
        cpf: usuario?.cpf || '00000000000', // ajuste conforme seus dados
        senhaPagamento: '1234' // pode vir de outro input ou processo separado
      })

      if (resultado.data?.sucesso) {
        toast.success('Cartão salvo com sucesso!')
        onClose()
      } else {
        toast.error('Erro ao salvar cartão.')
      }
    } catch (error) {
      console.error('Erro ao salvar cartão:', error)
      toast.error('Erro ao salvar cartão.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium">Número do Cartão</label>
        <input
          type="text"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="input"
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Nome do Titular</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input"
          placeholder="Nome impresso no cartão"
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Mês</label>
          <input
            type="text"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="input"
            placeholder="MM"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Ano</label>
          <input
            type="text"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="input"
            placeholder="AA"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">CVV</label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            className="input"
            placeholder="CVV"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={carregando}
      >
        {carregando ? 'Salvando...' : 'Salvar Cartão'}
      </button>

      <p className="text-xs text-gray-500 mt-2">
        Para sua segurança, não armazenamos os dados completos do seu cartão de crédito.
      </p>
    </form>
  )
}
