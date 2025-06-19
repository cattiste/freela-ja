// src/pages/NovoServico.jsx
import React, { useState } from 'react'
import './NovoServico.css'

export default function NovoServico() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Novo Serviço:', { titulo, descricao, preco })
    alert('Serviço cadastrado com sucesso!')
    // Aqui futuramente enviaremos os dados para o banco (Firebase, Supabase etc.)
    setTitulo('')
    setDescricao('')
    setPreco('')
  }

  return (
    <div className="novo-servico-container">
      <h2>Cadastro de Novo Serviço</h2>
      <form onSubmit={handleSubmit} className="form-servico">
        <label>Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex: Jantar Italiano Completo"
          required
        />

        <label>Descrição</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Descreva sua experiência gastronômica"
          required
        />

        <label>Preço (R$)</label>
        <input
          type="number"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="Ex: 150"
          required
        />

        <button type="submit">Cadastrar Serviço</button>
      </form>
    </div>
  )
}
