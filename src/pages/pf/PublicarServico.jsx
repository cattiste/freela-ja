import React, { useEffect, useState } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import DatePicker from 'react-multi-date-picker'
import { toast } from 'react-hot-toast'
import '@/styles/orange.css'

export default function PublicarServico({ pessoaFisica, servico = null, onSucesso }) {
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
    if (servico) {
      setForm({
        titulo: servico.titulo || '',
        descricao: servico.descricao || '',
        cidade: servico.cidade || '',
        endereco: servico.endereco || '',
        funcao: servico.funcao || '',
        tipo: servico.tipo || 'freela',
        valorDiaria: servico.valorDiaria || '',
        datas: servico.datas || [],
        urgente: servico.urgente || false
      })
    }
  }, [servico])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.titulo || !form.descricao || !form.cidade || !form.funcao) {
      return toast.error('Preencha todos os campos obrigatórios.')
    }
    if (form.tipo === 'freela' && form.datas.length === 0) {
      return toast.error('Selecione pelo menos uma data para Freela.')
    }
    if (form.tipo === 'freela' && !form.valorDiaria) {
      return toast.error('Informe o valor da diária.')
    }
    if (form.tipo === 'clt' && !form.endereco) {
      return toast.error('Informe o endereço para CLT.')
    }
    if (!pessoaFisica?.uid) {
      return toast.error('Usuário não autenticado.')
    }

    setEnviando(true)
    try {
      const datasParaFirestore = form.datas.map(d => {
        const jsDate = d.toDate ? d.toDate() : d
        return Timestamp.fromDate(jsDate)
      })

      const payload = {
        titulo: form.titulo,
        descricao: form.descricao,
        cidade: form.cidade,
        endereco: form.endereco || '',
        funcao: form.funcao,
        tipo: form.tipo,
        valorDiaria: form.valorDiaria ? Number(form.valorDiaria) : null,
        datas: datasParaFirestore,
        urgente: form.urgente,
        status: 'aberta',
        dataPublicacao: serverTimestamp(),
        criadoEm: serverTimestamp(),
        pessoaFisicaUid: pessoaFisica.uid,
        pessoaFisicaNome: pessoaFisica.nome
      }

      if (servico && servico.id) {
        const ref = doc(db, 'servicos', servico.id)
        await updateDoc(ref, payload)
        toast.success('Serviço atualizado com sucesso.')
      } else {
        const ref = collection(db, 'servicos')
        await addDoc(ref, payload)
        toast.success('Serviço publicado com sucesso.')
      }

      onSucesso?.()
    } catch (err) {
      console.error('Erro ao salvar serviço:', err)
      toast.error(`Falha ao salvar serviço: ${err.message}`)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-bold text-orange-600">
        {servico ? '✏️ Editar Serviço' : '📢 Publicar Novo Serviço'}
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              required
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-medium text-sm mb-1">Tipo do Serviço *</label>
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
            <label className="block font-medium text-sm mb-1">
              Valor da diária (R$) *
            </label>
            <input
              type="number"
              name="valorDiaria"
              value={form.valorDiaria}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        )}
      </div>

      {form.tipo === 'freela' && (
        <div>
          <label className="block font-medium text-sm mb-1">
            Datas agendadas *
          </label>
          <DatePicker
            multiple
            value={form.datas}
            onChange={(datas) => setForm(prev => ({ ...prev, datas }))}
            format="DD/MM/YYYY"
            className="orange"
            placeholder="Selecione datas"
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
        <label className="text-sm">Serviço urgente</label>
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
        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
      >
        {enviando ? 'Salvando...' : servico ? 'Atualizar Serviço' : 'Publicar Serviço'}
      </button>
    </form>
  )
}