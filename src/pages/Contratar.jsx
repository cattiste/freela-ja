import React from 'react'
import { Link } from 'react-router-dom'
import './Contratar.css'

export default function Contratar() {
  const profissionais = [
    {
      id: 'joao-silva',
      nome: 'João Silva',
      especialidade: 'Comida Italiana',
      cidade: 'São Paulo',
      avaliacao: 4.8,
      foto: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 'ana-oliveira',
      nome: 'Ana Oliveira',
      especialidade: 'Sushi Tradicional',
      cidade: 'Rio de Janeiro',
      avaliacao: 4.9,
      foto: 'https://i.pravatar.cc/150?img=2'
    },
    {
      id: 'bruno-cattiste',
      nome: 'Bruno Cattiste',
      especialidade: 'Churrasco Gaúcho',
      cidade: 'Porto Alegre',
      avaliacao: 5.0,
      foto: 'https://i.pravatar.cc/150?img=3'
    }
  ]

  return (
    <div className="contratar-container">
      <h2 className="contratar-title">Painel de Profissionais</h2>
      <p className="contratar-subtitle">Filtre por especialidade, cidade ou disponibilidade</p>

      <div className="filtros-container">
        <input type="text" placeholder="Especialidade (ex: Sushi, Churrasco...)" />
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
        {profissionais.map((prof) => (
          <div className="chef-card" key={prof.id}>
            <img src={prof.foto} alt={prof.nome} className="chef-foto" />
            <h3>{prof.nome}</h3>
            <p><strong>Especialidade:</strong> {prof.especialidade}</p>
            <p><strong>Cidade:</strong> {prof.cidade}</p>
            <p><strong>Avaliação:</strong> {prof.avaliacao} ⭐</p>
            <Link to={`/perfil/${prof.id}`}>
              <button>Ver Perfil</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
