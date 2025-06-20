import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Contratar.css'

const profissionais = [
  {
    id: '1',
    nome: 'João Silva',
    especialidade: 'Comida Italiana',
    cidade: 'São Paulo',
    imagem: 'https://randomuser.me/api/portraits/men/32.jpg',
    avaliacao: 4.8
  },
  {
    id: '2',
    nome: 'Ana Oliveira',
    especialidade: 'Sushi Tradicional',
    cidade: 'Rio de Janeiro',
    imagem: 'https://randomuser.me/api/portraits/women/44.jpg',
    avaliacao: 4.9
  }
]

export default function Contratar() {
  const navigate = useNavigate()

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
          <div key={prof.id} className="chef-card">
            <img src={prof.imagem} alt={prof.nome} className="chef-foto" />
            <h3>{prof.nome}</h3>
            <p><strong>Especialidade:</strong> {prof.especialidade}</p>
            <p><strong>Cidade:</strong> {prof.cidade}</p>
            <p><strong>Avaliação:</strong> ⭐ {prof.avaliacao}</p>
            <button onClick={() => navigate(`/perfil/${prof.id}`)}>Ver Perfil</button>
          </div>
        ))}
      </div>
    </div>
  )
}
