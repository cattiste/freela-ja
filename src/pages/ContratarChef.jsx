// src/pages/ContratarChef.jsx
import React, { useState } from 'react';

function ContratarChef() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    dataEvento: '',
    tipoServico: '',
    detalhes: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Pedido enviado com sucesso!');
    console.log(form);
    // Aqui você pode conectar com backend, planilha ou banco futuramente
  };

  return (
    <div className="form-container">
      <h2>Contratar um Chef</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nome" placeholder="Seu nome" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Seu e-mail" onChange={handleChange} required />
        <input type="tel" name="telefone" placeholder="Telefone/WhatsApp" onChange={handleChange} required />
        <input type="date" name="dataEvento" onChange={handleChange} required />
        <select name="tipoServico" onChange={handleChange} required>
          <option value="">Tipo de serviço</option>
          <option value="jantar">Jantar Particular</option>
          <option value="evento">Evento Corporativo</option>
          <option value="buffet">Buffet</option>
          <option value="outro">Outro</option>
        </select>
        <textarea name="detalhes" placeholder="Descreva o evento, número de pessoas, local etc." onChange={handleChange} />
        <button type="submit">Enviar Pedido</button>
      </form>
    </div>
  );
}

export default ContratarChef;
