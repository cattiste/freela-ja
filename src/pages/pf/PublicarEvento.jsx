import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function PublicarEvento() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '',
    celular: '',
    tipoEvento: '',
    dataHora: '',
    endereco: '',
    funcoes: [],
    descricao: '',
    valor: ''
  })

  const funcoesDisponiveis = ['Churrasqueiro', 'DJ', 'Barman', 'Segurança', 'Garçom', 'Cozinheira']

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFuncaoToggle = (funcao) => {
    setForm((prev) => ({
      ...prev,
      funcoes: prev.funcoes.includes(funcao)
        ? prev.funcoes.filter(f => f !== funcao)
        : [...prev.funcoes, funcao]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nome || !form.celular || !form.tipoEvento || !form.dataHora || !form.endereco || !form.valor || form.funcoes.length === 0) {
      toast.error('Preencha todos os campos obrigatórios!')
      return
    }

    try {
      const docRef = await addDoc(collection(db, 'eventosPublicos'), {
        ...form,
        status: 'pendente',
        criadoEm: serverTimestamp()
      })

      toast.success('Evento criado! Redirecionando para pagamento...')
      navigate(`/pagamento-evento/${docRef.id}`)

    } catch (err) {
      console.error(err)
      toast.error('Erro ao publicar evento.')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Publicar Evento</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome completo" className="w-full p-2 border rounded" />

        <input name="celular" value={form.celular} onChange={handleChange} placeholder="Celular / WhatsApp" className="w-full p-2 border rounded" />

        <input name="tipoEvento" value={form.tipoEvento} onChange={handleChange} placeholder="Tipo de evento (ex: Futebol, Aniversário)" className="w-full p-2 border rounded" />

        <input type="datetime-local" name="dataHora" value={form.dataHora} onChange={handleChange} className="w-full p-2 border rounded" />

        <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço completo" className="w-full p-2 border rounded" />

        <div>
          <label className="block font-medium mb-2">Funções necessárias:</label>
          <div className="flex flex-wrap gap-2">
            {funcoesDisponiveis.map((funcao) => (
              <button
                type="button"
                key={funcao}
                onClick={() => handleFuncaoToggle(funcao)}
                className={`px-3 py-1 rounded-full border ${form.funcoes.includes(funcao) ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}
              >
                {funcao}
              </button>
            ))}
          </div>
        </div>

        <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição (opcional)" className="w-full p-2 border rounded" />

        <input name="valor" type="number" value={form.valor} onChange={handleChange} placeholder="Valor total (R$)" className="w-full p-2 border rounded" />

        <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
          Publicar e pagar
        </button>
      </form>
    </div>
  )
}
