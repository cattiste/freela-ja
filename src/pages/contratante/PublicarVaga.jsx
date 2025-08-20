import React, { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function PublicarVaga() {
  const { usuario } = useAuth()

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    tipo: 'freela',
    valorDiaria: '',
    valorSalario: ''
  })

  const publicar = async () => {
    const { titulo, descricao, tipo, valorDiaria, valorSalario } = form

    if (!titulo || !descricao) return toast.error('Preencha todos os campos.')

    const payload = {
      titulo,
      descricao,
      tipo,
      publicadoPor: usuario?.uid,
      criadoEm: serverTimestamp()
    }

    if (tipo === 'freela') {
      if (!valorDiaria) return toast.error('Informe o valor da diária.')
      payload.valorDiaria = Number(valorDiaria)
    }

    if (tipo === 'clt') {
      if (!valorSalario) return toast.error('Informe o salário.')
      payload.valorSalario = Number(valorSalario)
    }

    try {
      await addDoc(collection(db, 'vagas'), payload)
      toast.success('Vaga publicada com sucesso!')
      setForm({ titulo: '', descricao: '', tipo: 'freela', valorDiaria: '', valorSalario: '' })
    } catch (error) {
      console.error('Erro ao publicar vaga:', error)
      toast.error('Erro ao publicar vaga.')
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-xl mx-auto mt-4">
      <h1 className="text-2xl font-bold mb-4">Publicar Vaga</h1>

      <label className="block mb-2">Título da Vaga</label>
      <input
        className="w-full p-2 border rounded mb-4"
        placeholder="Título da vaga"
        value={form.titulo}
        onChange={(e) => setForm({ ...form, titulo: e.target.value })}
      />

      <label className="block mb-2">Descrição</label>
      <textarea
        className="w-full p-2 border rounded mb-4"
        placeholder="Descrição"
        value={form.descricao}
        onChange={(e) => setForm({ ...form, descricao: e.target.value })}
      />

      <label className="block mb-2">Tipo</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={form.tipo}
        onChange={(e) => setForm({ ...form, tipo: e.target.value })}
      >
        <option value="freela">Freela</option>
        <option value="clt">CLT</option>
      </select>

      {form.tipo === 'freela' && (
        <>
          <label className="block mb-2">Valor da Diária (R$)</label>
          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Valor da diária"
            value={form.valorDiaria}
            onChange={(e) => setForm({ ...form, valorDiaria: e.target.value })}
          />
        </>
      )}

      {form.tipo === 'clt' && (
        <>
          <label className="block mb-2">Salário (R$)</label>
          <input
            className="w-full p-2 border rounded mb-4"
            placeholder="Salário mensal"
            value={form.valorSalario}
            onChange={(e) => setForm({ ...form, valorSalario: e.target.value })}
          />
        </>
      )}

      <button
        onClick={publicar}
        className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition"
      >
        Publicar
      </button>
    </div>
  )
}
