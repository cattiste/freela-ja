// src/pages/estabelecimento/PublicarVaga.jsx
import React, { useEffect, useState } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import DatePicker from 'react-multi-date-picker'
import { toast } from 'react-hot-toast'
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

  // Se vier pra editar, pré-preenche o form
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
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validações básicas
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
    if (!estabelecimento?.uid) {
      return toast.error('Usuário não autenticado.')
    }

    setEnviando(true)

    try {
      // Só aqui dentro pra pegar qualquer erro, inclusive de payload
      const payload = {
        ...form,
        criadoEm: serverTimestamp(),
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome
      }
      console.log('[PublicarVaga] Payload ->', payload)

      if (vaga) {
        console.log(`[PublicarVaga] Atualizando vaga ${vaga.id}`)
        const ref = doc(db, 'vagas', vaga.id)
        await updateDoc(ref, payload)
        toast.success('Vaga atualizada com sucesso.')
      } else {
        console.log('[PublicarVaga] Criando nova vaga')
        const ref = collection(db, 'vagas')
        await addDoc(ref, payload)
        toast.success('Vaga publicada com sucesso.')
      }

      onSucesso?.()
    } catch (err) {
      console.error('[PublicarVaga] Erro ao salvar vaga:', err)
      toast.error(`Falha ao salvar vaga: ${err.message}`)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-orange-600">
        {vaga ? '✏️ Editar Vaga' : '📢 Publicar Nova Vaga'}
      </h2>

      {/* …seu markup permanece igual… */}

      <button
        type="submit"
        disabled={enviando}
        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
      >
        {enviando ? 'Salvando...' : vaga ? 'Atualizar Vaga' : 'Publicar Vaga'}
      </button>
    </form>
  )
}
