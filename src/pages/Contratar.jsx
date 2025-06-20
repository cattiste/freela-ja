import React from 'react'
import './Contratar.css'

export default function Contratar() {
  const profissionais = [
    {
      nome: 'João Silva',
      especialidade: 'Garçom',
      cidade: 'São Paulo',
      foto: 'https://randomuser.me/api/portraits/men/32.jpg',
      avaliacao: 4
    },
    {
      nome: 'Ana Oliveira',
      especialidade: 'Chef de Sushi',
      cidade: 'Rio de Janeiro',
      foto: 'https://randomuser.me/api/portraits/women/44.jpg',
      avaliacao: 5
    },
    {
      nome: 'Carlos Mendes',
      especialidade: 'Segurança',
      cidade: 'Belo Horizonte',
      foto: 'https://randomuser.me/api/portraits/men/65.jpg',
      avaliacao: 3
    }
  ]

  const renderEstrelas = (qtd) => {
    return '★'.repeat(qtd) + '☆'.repeat(5 - qtd)
  }

  return (
    <div className="contratar-container">
      <h2 className="contratar-title">Encontre o Profissional Ideal</h2>
      <p className="contratar-subtitle">Filtre por função, cidade ou disponibilidade</p>

      <div className="filtros-container">
        <input type="text" placeholder="Função (ex: Garçom, Chef, Segurança...)" />
        <input type="text" placeholder="Cidade" />
        <select>
          <option>Disponibilidade</option>
          <option>Hoje</option>
          <option>Esta semana</option>
          <option>Este mês</option>
        </select>
        <button>Buscar</button>
      </div>

      <div className="resultado-chefs">
        {profissionais.map((p, i) => (
          <div className="chef-card" key={i}>
            <img src={p.foto} alt={p.nome} className="foto-perfil" />
            <h3>{p.nome}</h3>
            <p><strong>Função:</strong> {p.especialidade}</p>
            <p><strong>Cidade:</strong> {p.cidade}</p>
            <div className="avaliacao">{renderEstrelas(p.avaliacao)}</div>
            <button>Ver Perfil</button>
          </div>
        ))}
      </div>
    </div>
  )
}
