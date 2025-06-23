// src/pages/PainelVagas.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function PainelVagas() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [editandoIndex, setEditandoIndex] = useState(null)

  useEffect(() => {
    const vagasSalvas = JSON.parse(localStorage.getItem('vagasEstabelecimento') || '[]')
    setVagas(vagasSalvas)
  }, [])

  const salvarVagasNoStorage = (vagasAtualizadas) => {
    localStorage.setItem('vagasEstabelecimento', JSON.stringify(vagasAtualizadas))
  }

  const adicionarOuEditar = (e) => {
    e.preventDefault()
    if (!titulo.trim() || !descricao.trim()) return alert('Preencha todos os campos!')

    let novasVagas = [...vagas]

    if (editandoIndex !== null) {
      novasVagas[editandoIndex] = { titulo, descricao }
      setEditandoIndex(null)
    } else {
      novasVagas.push({ titulo, descricao })
    }

    setVagas(novasVagas)
    salvarVagasNoStorage(novasVagas)
    setTitulo('')
    setDescricao('')
  }

  const editarVaga = (index) => {
    setTitulo(vagas[index].titulo)
    setDescricao(vagas[index].descricao)
    setEditandoIndex(index)
  }

  const deletarVaga = (index) => {
    if (!window.confirm('Deseja realmente excluir essa vaga?')) return
    const novasVagas = vagas.filter((_, i) => i !== index)
    setVagas(novasVagas)
    salvarVagasNoStorage(novasVagas)
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <button
        onClick={() => navigate(-1)}
        className="botao-voltar-home mb-6"
        aria-label="Voltar"
        style={{ position: 'fixed', top: '1.5rem', left: '1.5rem' }}
      >
        ← Voltar
      </button>

      <h1 className="text-3xl font-bold text-center mb-6">Painel de Vagas</h1>

      <form onSubmit={adicionarOuEditar} className="max-w-xl mx-auto bg-white p-6 rounded shadow space-y-4">
        <input
          type="text"
          placeholder="Título da vaga"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="input"
          required
        />
        <textarea
          placeholder="Descrição da vaga"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="input"
          rows={4}
          required
        />
        <button type="submit" className="home-button w-full">
          {editandoIndex !== null ? 'Salvar Alterações' : 'Adicionar Vaga'}
        </button>
      </form>

      <div className="max-w-xl mx-auto mt-8">
        {vagas.length === 0 && <p className="text-center text-gray-600">Nenhuma vaga cadastrada.</p>}

        {vagas.map((vaga, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded shadow mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex-grow">
              <h2 className="font-semibold text-lg">{vaga.titulo}</h2>
              <p className="text-gray-700">{vaga.descricao}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => editarVaga(idx)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => deletarVaga(idx)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
