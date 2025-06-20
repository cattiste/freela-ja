import React from 'react'
import './Contratar.css'

export default function Contratar() {
  const profissionais = [
    {
      nome: 'João Silva',
      especialidade: 'Churrasqueiro',
      cidade: 'São Paulo',
      avaliacao: 4,
      foto: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      nome: 'Ana Oliveira',
      especialidade: 'Sushiwoman',
      cidade: 'Rio de Janeiro',
      avaliacao: 5,
      foto: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      nome: 'Carlos Mendes',
      especialidade: 'Garçom',
      cidade: 'Belo Horizonte',
      avaliacao: 3,
      foto: 'https://randomuser.me/api/portraits/men/45.jpg'
    }
  ]

  return (
    <div className="contratar-container">
      <h2 className="contratar-title">Painel de Profissionais</h2>
      <p className="contratar-subtitle">Filtre por especialidade, cidade ou disponibilidade</p>

      <div className="filtros-container">
        <input type="text" placeholder="Especialidade (ex: Garçom, Cozinheiro...)" />
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
            <p><strong>Especialidade:</strong> {p.especialidade}</p>
            <p><strong>Cidade:</strong> {p.cidade}</p>
            <div className="avaliacao">
              {'★'.repeat(p.avaliacao)}{'☆'.repeat(5 - p.avaliacao)}
            </div>
            <button className="botao-perfil">Ver Perfil</button>
          </div>
        ))}
      </div>
    </div>
  )
}
