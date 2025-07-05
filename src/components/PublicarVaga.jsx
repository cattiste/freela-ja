import React, { useEffect, useState } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import DatePicker from 'react-multi-date-picker'
import '@/styles/orange.css'


export default function PublicarVaga({ estabelecimento, vaga = null, onSucesso }) {
  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    cidade: '',
    endereco: '',
    funcao: '',
    tipo: 'freela',
    valorDiaria: '',
    datas: [],
    urgente: false
  })
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (vaga) {
      setForm({
        ...vaga,
        datas: vaga.datas || []
      })
    }
  }, [vaga])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.titulo || !form.descricao || !form.cidade || !form.funcao || !form.tipo) {
      return alert('Preencha todos os campos obrigatórios.')
    }

    if (form.tipo === 'freela' && (!form.datas || form.datas.length === 0)) {
      return alert('Selecione pelo menos uma data para a vaga Freela.')
    }

    if (form.tipo === 'freela' && !form.valorDiaria) {
      return alert('Informe o valor da diária.')
    }

    if (form.tipo === 'clt' && !form.endereco) {
      return alert('Informe o endereço da vaga CLT.')
    }

    setEnviando(true)

    const payload = {
      ...form,
      criadoEm: serverTimestamp(),
      estabelecimentoUid: estabelecimento.uid,
      estabelecimentoNome: estabelecimento.nome
    }

    try {
      if (vaga) {
        const ref = doc(db, 'vagas', vaga.id)
        await updateDoc(ref, payload)
        alert('Vaga atualizada com sucesso.')
      } else {
        const ref = collection(db, 'vagas')
        await addDoc(ref, payload)
        alert('Vaga publicada com sucesso.')
      }
      onSucesso?.()
    } catch (err) {
      console.error('Erro ao salvar vaga:', err)
      alert('Erro ao salvar vaga.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-orange-600">
        {vaga ? '✏️ Editar Vaga' : '📢 Publicar Nova Vaga'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-sm mb-1">Título *</label>
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-sm mb-1">Função *</label>
          <input
            type="text"
            name="funcao"
            value={form.funcao}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-sm mb-1">Cidade *</label>
          <input
            type="text"
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {form.tipo === 'clt' && (
          <div>
            <label className="block font-medium text-sm mb-1">Endereço *</label>
            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required={form.tipo === 'clt'}
            />
          </div>
        )}

        <div>
          <label className="block font-medium text-sm mb-1">Tipo da Vaga *</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="freela">Freela</option>
            <option value="clt">CLT</option>
          </select>
        </div>

        {form.tipo === 'freela' && (
          <div>
            <label className="block font-medium text-sm mb-1">Valor da diária (R$) *</label>
            <input
              type="number"
              name="valorDiaria"
              value={form.valorDiaria}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required={form.tipo === 'freela'}
            />
          </div>
        )}
      </div>

      {form.tipo === 'freela' && (
        <div>
          <label className="block font-medium text-sm mb-1">Datas agendadas *</label>
          <DatePicker
            multiple
            value={form.datas}
            onChange={(datas) => setForm((prev) => ({ ...prev, datas }))}
            format="DD/MM/YYYY"
            className="orange"
            placeholder="Selecione uma ou mais datas"
          />
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          name="urgente"
          checked={form.urgente}
          onChange={handleChange}
        />
        <label className="text-sm">Vaga urgente</label>
      </div>

      <div>
        <label className="block font-medium text-sm mb-1">Descrição *</label>
        <textarea
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          rows={4}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
      >
        {enviando ? 'Salvando...' : vaga ? 'Atualizar Vaga' : 'Publicar Vaga'}
      </button>
    </form>
  )
}