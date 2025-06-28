import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PublicarVaga() {
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState('CLT')
  const [salario, setSalario] = useState('')
  const [descricao, setDescricao] = useState('')
  const [emailContato, setEmailContato] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!titulo || !empresa || !cidade || !salario || !descricao || !emailContato) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    const novaVaga = { titulo, empresa, cidade, tipo, salario, descricao, emailContato, data: new Date().toISOString() }
    try {
      await addDoc(collection(db, 'vagas'), novaVaga)
      alert('Vaga publicada com sucesso!')
      navigate('/painelestabelecimento')
    } catch (error) {
      alert('Erro ao publicar vaga: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full flex justify-between px-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition"
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white py-2 px-4 rounded-full hover:bg-blue-700 transition"
        >
          🏠 Home
        </button>
      </div>

      <main className="max-w-md mx-auto mt-28 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Publicar Vaga CLT</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Título da Vaga"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Nome da Empresa"
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Cidade"
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Salário"
            value={salario}
            onChange={e => setSalario(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Descrição da vaga"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            rows={4}
            disabled={loading}
            required
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <input
            type="email"
            placeholder="E-mail para contato"
            value={emailContato}
            onChange={e => setEmailContato(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 py-3 rounded-full font-semibold text-white transition ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Publicando...' : 'Publicar Vaga'}
          </button>
        </form>
      </main>
    </>
  )
}
