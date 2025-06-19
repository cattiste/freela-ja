// src/pages/Cadastro.jsx
import React, { useState } from 'react'

export default function Cadastro() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    especialidade: '',
    descricao: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Dados cadastrados:', form)
    alert('Cadastro enviado com sucesso!')
    // aqui futuramente vamos integrar com banco de dados
  }

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Cadastro de Chef</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={form.nome}
          onChange={handleChange}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={form.senha}
          onChange={handleChange}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="text"
          name="especialidade"
          placeholder="Especialidade culinária (ex: sushi, churrasco...)"
          value={form.especialidade}
          onChange={handleChange}
          required
          style={{ padding: '10px' }}
        />
        <textarea
          name="descricao"
          placeholder="Descrição pessoal, experiência, formação..."
          value={form.descricao}
          onChange={handleChange}
          rows="4"
          style={{ padding: '10px' }}
        ></textarea>

        <button type="submit" style={{ padding: '12px', backgroundColor: '#222', color: '#fff', border: 'none' }}>
          Cadastrar
        </button>
      </form>
    </div>
  )
}
