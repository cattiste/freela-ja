import React, { useState } from 'react'

export default function Contratar() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    data: '',
    tipoServico: '',
    detalhes: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Pedido enviado com sucesso! Obrigado, ${formData.nome}!`)
    // Aqui você pode adicionar lógica de envio (ex: API ou banco)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Contratar um Chef</h2>
      <p>Preencha os dados abaixo e aguarde a resposta de um chef disponível.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <label>Nome completo:</label><br />
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} required /><br />

        <label>Email para contato:</label><br />
        <input type="email" name="email" value={formData.email} onChange={handleChange} required /><br />

        <label>Data do evento:</label><br />
        <input type="date" name="data" value={formData.data} onChange={handleChange} required /><br />

        <label>Tipo de serviço:</label><br />
        <select name="tipoServico" value={formData.tipoServico} onChange={handleChange} required>
          <option value="">-- Selecione --</option>
          <option value="Almoço">Almoço</option>
          <option value="Jantar">Jantar</option>
          <option value="Churrasco">Churrasco</option>
          <option value="Evento completo">Evento completo</option>
        </select><br />

        <label>Detalhes do pedido:</label><br />
        <textarea name="detalhes" value={formData.detalhes} onChange={handleChange} rows="5" /><br />

        <button type="submit">Enviar pedido</button>
      </form>
    </div>
  )
}
