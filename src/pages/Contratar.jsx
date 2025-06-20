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
  <div className="chef-card">
    <img src="https://i.pravatar.cc/300?img=1" alt="Chef João" />
    <h3>João Silva</h3>
    <p>Especialidade: Churrasqueiro Profissional</p>
    <p>Cidade: São Paulo</p>
    <p>Avaliação: ⭐ 4.7</p>
    <Link to="/perfil/1">
      <button>Ver Perfil</button>
    </Link>
  </div>

  <div className="chef-card">
    <img src="https://i.pravatar.cc/300?img=2" alt="Chef Ana" />
    <h3>Ana Oliveira</h3>
    <p>Especialidade: Garçonete de Eventos</p>
    <p>Cidade: Rio de Janeiro</p>
    <p>Avaliação: ⭐ 4.9</p>
    <Link to="/perfil/2">
      <button>Ver Perfil</button>
    </Link>
  </div>
</div>
  )
}
