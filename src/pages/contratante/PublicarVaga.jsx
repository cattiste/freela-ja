import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function PublicarVaga() {
  const { usuario } = useAuth()
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    tipo: 'freela', // ou 'clt'
    valorDiaria: '',
    valorSalario: ''
  })

  const publicar = async () => {
    const { titulo, descricao, tipo, valorDiaria, valorSalario } = form

    if (!titulo || !descricao) return toast.error('Preencha todos os campos obrigatórios')

    const payload = {
      titulo,
      descricao,
      tipo,
      publicadoPor: usuario.uid,
      criadoEm: serverTimestamp()
    }

    if (tipo === 'freela') {
      if (!valorDiaria) return toast.error('Informe o valor da diária para freela.')
      payload.valorDiaria = Number(valorDiaria)
    }

    if (tipo === 'clt') {
      if (!valorSalario) return toast.error('Informe o valor do salário para CLT.')
      payload.valorSalario = Number(valorSalario)
    }

    try {
      await addDoc(collection(db, 'vagas'), payload)
      toast.success('Vaga publicada com sucesso!')
      setForm({
        titulo: '',
        descricao: '',
        tipo: 'freela',
        valorDiaria: '',
        valorSalario: ''
      })
    } catch (e) {
      console.error('Erro ao publicar vaga:', e)
      toast.error('Erro ao publicar vaga')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Publicar Vaga</h1>

      <input
        className="border p-2 mb-2 w-full"
        placeholder="Título da Vaga"
        value={form.titulo}
        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
      />

      <textarea
        className="border p-2 mb-2 w-full"
        placeholder="Descrição"
        value={form.descricao}
        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
      />

      <select
        className="border p-2 mb-2 w-full"
        value={form.tipo}
        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
      >
        <option value="freela">Freela</option>
        <option value="clt">CLT</option>
      </select>

      {form.tipo === 'freela' && (
        <input
          className="border p-2 mb-2 w-full"
          placeholder="Valor da Diária (R$)"
          value={form.valorDiaria}
          onChange={(e) => setForm({ ...form, valorDiaria: e.target.value })}
        />
      )}

      {form.tipo === 'clt' && (
        <input
          className="border p-2 mb-2 w-full"
          placeholder="Salário (R$)"
          value={form.valorSalario}
          onChange={(e) => setForm({ ...form, valorSalario: e.target.value })}
        />
      )}

      <button
        onClick={publicar}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Publicar
      </button>
    </div>
  )
}
