import React, { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useNavigate } from 'react-router-dom'

export default function EditarPerfilFreela() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '',
    funcao: '',
    email: '',
    celular: '',
    endereco: '',
    valorDiaria: '',
    tipoContrato: '',
    foto: ''
  })
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    const fetchDados = async () => {
      const docRef = doc(db, 'usuarios', usuario.uid)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        setForm(snap.data())
      } else {
        alert('Usuário não encontrado.')
        navigate('/login')
      }
      setLoading(false)
    }
    fetchDados()
  }, [navigate])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSalvando(true)

    try {
      const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
      if (!usuario) throw new Error('Usuário não logado')

      const docRef = doc(db, 'usuarios', usuario.uid)
      await updateDoc(docRef, form)
      alert('Perfil atualizado com sucesso!')
      navigate('/painel-freela')
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar perfil.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-lg"
      >
        <h1 className="text-2xl font-bold mb-6">Editar Perfil Freelancer</h1>

        <label className="block mb-3">
          Nome
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block mb-3">
          Função
          <input
            type="text"
            name="funcao"
            value={form.funcao}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block mb-3">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block mb-3">
          Celular
          <input
            type="text"
            name="celular"
            value={form.celular}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block mb-3">
          Endereço
          <input
            type="text"
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block mb-3">
          Valor Diária
          <input
            type="number"
            name="valorDiaria"
            value={form.valorDiaria}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block mb-3">
          Tipo Contrato
          <input
            type="text"
            name="tipoContrato"
            value={form.tipoContrato}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
          />
        </label>

        <label className="block mb-3">
          URL da Foto
          <input
            type="text"
            name="foto"
            value={form.foto}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="https://..."
          />
        </label>

        <button
          type="submit"
          disabled={salvando}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {salvando ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </div>
  )
}
