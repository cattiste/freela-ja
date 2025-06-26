import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function EditarFreela() {
  const navigate = useNavigate()
  const { id } = useParams() // pega o uid do freela da rota
  const [form, setForm] = useState({
    nome: '',
    email: '',
    funcao: '',
    foto: '',
    especialidade: '',
    endereco: '',
    descricao: '',
    diaria: '', // campo nova diária
  })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      if (!id) {
        alert('Usuário inválido.')
        navigate('/')
        return
      }

      try {
        const freelaRef = doc(db, 'usuarios', id)
        const freelaSnap = await getDoc(freelaRef)

        if (!freelaSnap.exists()) {
          alert('Usuário não encontrado.')
          navigate('/')
          return
        }

        const dados = freelaSnap.data()
        setForm({
          nome: dados.nome || '',
          email: dados.email || '',
          funcao: dados.funcao || '',
          foto: dados.foto || '',
          especialidade: dados.especialidade || '',
          endereco: dados.endereco || '',
          descricao: dados.descricao || '',
          diaria: dados.diaria || '',
        })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        alert('Erro ao carregar perfil.')
        navigate('/')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setCarregando(true)
      const freelaRef = doc(db, 'usuarios', id)

      await updateDoc(freelaRef, {
        nome: form.nome,
        email: form.email,
        funcao: form.funcao,
        foto: form.foto,
        especialidade: form.especialidade,
        endereco: form.endereco,
        descricao: form.descricao,
        diaria: form.diaria,
      })

      alert('Perfil atualizado com sucesso!')
      navigate('/painelfreela')
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      alert('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Editar Perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label>
          Nome completo:
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label>
          E-mail:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label>
          Função / Cargo:
          <input
            type="text"
            name="funcao"
            value={form.funcao}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label>
          URL da Foto:
          <input
            type="text"
            name="foto"
            value={form.foto}
            onChange={handleChange}
            placeholder="Link para foto de perfil"
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label>
          Especialidade:
          <input
            type="text"
            name="especialidade"
            value={form.especialidade}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label>
          Endereço:
          <input
            type="text"
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label>
          Descrição:
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded"
          />
        </label>

        <label>
          Valor da diária (ex: R$ 150):
          <input
            type="text"
            name="diaria"
            value={form.diaria}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="Valor cobrado por dia"
          />
        </label>

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition"
        >
          {carregando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  )
}
