// src/pages/freela/RecebimentosFreela.jsx
import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export default function RecebimentosFreela() {
  const usuario = auth.currentUser  // corrige aqui
  const [form, setForm] = useState({
    nomeTitular: '',
    cpf: '',
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: '',
    chavePix: ''
  })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    // se não tiver usuário, para o loading
    if (!usuario) {
      setCarregando(false)
      return
    }
    const fetchDados = async () => {
      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const dados = snap.data().dadosBancarios || {}
          setForm({
            nomeTitular: dados.nomeTitular || '',
            cpf: dados.cpf || '',
            banco: dados.banco || '',
            agencia: dados.agencia || '',
            conta: dados.conta || '',
            tipoConta: dados.tipoConta || '',
            chavePix: dados.chavePix || ''
          })
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setCarregando(false)
      }
    }
    fetchDados()
  }, [usuario])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const salvar = async () => {
    if (!usuario) return
    setSalvando(true)
    try {
      const ref = doc(db, 'usuarios', usuario.uid)
      await updateDoc(ref, { dadosBancarios: form })
      alert('Dados bancários salvos com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar dados.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <p className="text-center text-orange-500">Carregando dados...</p>
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-5">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">💵 Dados para Recebimento</h2>

      <input
        name="nomeTitular"
        value={form.nomeTitular}
        onChange={handleChange}
        placeholder="Nome do Titular"
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="cpf"
        value={form.cpf}
        onChange={handleChange}
        placeholder="CPF (somente números)"
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="banco"
        value={form.banco}
        onChange={handleChange}
        placeholder="Banco (ex: 001 - Banco do Brasil)"
        className="w-full border rounded px-3 py-2"
      />
      <div className="flex gap-2">
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
        className="w-full border rounded px-3 py-2"
      />
      <input
        name="chavePix"
        value={form.chavePix}
        onChange={handleChange}
        placeholder="Chave PIX"
        className="w-full border rounded px-3 py-2"
      />

      <button
        onClick={salvar}
        disabled={salvando}
        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar Dados'}
      </button>
    </div>
  )
}
