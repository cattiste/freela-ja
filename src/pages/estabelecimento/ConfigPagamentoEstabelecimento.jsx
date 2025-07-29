// src/pages/estabelecimento/ConfigPagamentoEstabelecimento.jsx
import React, { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

import { db } from '@/firebase'
import { auth } from '@/firebase'
import { useNavigate } from 'react-router-dom'

export default function ConfigPagamentoEstabelecimento() {
  const navigate = useNavigate()
  const usuario = auth.currentUser
  const [form, setForm] = useState({
    nomeTitular: '',
    cpf: '',
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: '',
    chavePix: '',
    cardHolder: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    pagamentoAtivo: false,
  })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  // Carrega configurações existentes
  useEffect(() => {
    if (!usuario) return navigate('/login')
    const load = async () => {
      try {
        const ref = doc(db, 'configuracoes', usuario.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setForm({
            ...form,
            ...snap.data(),
          })
        }
      } catch (err) {
        console.error(err)
        toast.error('Erro ao carregar configurações')
      } finally {
        setCarregando(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      await updateDoc(doc(db, 'configuracoes', usuario.uid), {
        ...form,
        atualizadoEm: serverTimestamp(),
      })
      toast.success('Configurações salvas com sucesso')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <p className="text-center text-orange-500 mt-6">Carregando configurações...</p>
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-orange-700">⚙️ Configurações & Pagamentos</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Dados Bancários */}
        <div>
          <h3 className="text-lg font-semibold mb-2">💵 Dados Bancários / PIX</h3>
          <input
            name="nomeTitular"
            value={form.nomeTitular}
            onChange={handleChange}
            placeholder="Nome do Titular"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <input
            name="cpf"
            value={form.cpf}
            onChange={handleChange}
            placeholder="CPF (somente números)"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <input
            name="banco"
            value={form.banco}
            onChange={handleChange}
            placeholder="Banco (ex: 001 - Banco do Brasil)"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <div className="flex gap-2 mb-3">
            <input
              name="agencia"
              value={form.agencia}
              onChange={handleChange}
              placeholder="Agência"
              className="flex-1 border rounded px-3 py-2"
            />
            <input
              name="conta"
              value={form.conta}
              onChange={handleChange}
              placeholder="Conta"
              className="flex-1 border rounded px-3 py-2"
            />
          </div>
          <input
            name="tipoConta"
            value={form.tipoConta}
            onChange={handleChange}
            placeholder="Tipo de Conta (corrente/poupança)"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <input
            name="chavePix"
            value={form.chavePix}
            onChange={handleChange}
            placeholder="Chave PIX"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Dados de Cartão */}
        <div>
          <h3 className="text-lg font-semibold mb-2">💳 Dados do Cartão</h3>
          <input
            name="cardHolder"
            value={form.cardHolder}
            onChange={handleChange}
            placeholder="Nome no Cartão"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <input
            name="cardNumber"
            value={form.cardNumber}
            onChange={handleChange}
            placeholder="Número do Cartão"
            className="w-full border rounded px-3 py-2 mb-3"
          />
          <div className="flex gap-2 mb-3">
            <input
              name="cardExpiry"
              value={form.cardExpiry}
              onChange={handleChange}
              placeholder="Validade (MM/AA)"
              className="flex-1 border rounded px-3 py-2"
            />
            <input
              name="cardCvv"
              value={form.cardCvv}
              onChange={handleChange}
              placeholder="CVV"
              className="flex-1 border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Situação de Pagamento */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="pagamentoAtivo"
              checked={form.pagamentoAtivo}
              onChange={handleChange}
            />
            <span>Ativar pagamentos automáticos</span>
          </label>
        </div>

        {/* Ações */}
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={salvando}
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  )
}
