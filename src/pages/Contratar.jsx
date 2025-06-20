// src/pages/Contratar.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Contratar.css'

const profissionais = [
  {
    id: '1',
    nome: 'João Silva',
    especialidade: 'Churrasqueiro Profissional',
    cidade: 'São Paulo',
    imagem: 'https://i.pravatar.cc/300?img=1',
    avaliacao: 4.7
  },
  {
    id: '2',
    nome: 'Ana Oliveira',
    especialidade: 'Garçonete de Eventos',
    cidade: 'Rio de Janeiro',
    imagem: 'https://i.pravatar.cc/300?img=2',
    avaliacao: 4.9
  },
  {
    id: '3',
    nome: 'Carlos Pereira',
    especialidade: 'Segurança Privado',
    cidade: 'Campinas',
    imagem: 'https://i.pravatar.cc/300?img=3',
    avaliacao: 4.6
  },
  {
    id: '4',
    nome: 'Marina Dias',
    especialidade: 'Bartender Profissional',
    cidade: 'São Paulo',
    imagem: 'https://i.pravatar.cc/300?img=4',
    avaliacao: 4.8
  }
]

export default function Contratar() {
  const navigate = useNavigate()

  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('')

  const filtrarProfissionais = () => {
    return profissionais.filter(pro =>
      pro.especialidade.toLowerCase().includes(filtroEspecialidade.toLowerCase()) &&
      pro.cidade.toLowerCase().includes(filtroCidade.toLowerCase())
      // Disponibilidade futura: aqui poderíamos filtrar por agenda
    )
  }

  const resultado = filtrarProfissionais()

  return (
    <div className="contratar-container">
      <h2 className="contratar-title">Painel de Profissionais</h2>
      <p className="contratar-subtitle">Filtre por especialidade, cidade ou disponibilidade</p>

      <div className="filtros-container">
        <input
          type="text"
          placeholder="Especialidade (ex: Sushi, Churrasco...)"
          value={filtroEspecialidade}
          onChange={e => setFiltroEspecialidade(e.target.value)}
        />
        <input
          type="text"
          placeholder="Cidade"
          value={filtroCidade}
          onChange={e => setFiltroCidade(e.target.value)}
        />
        <select
          value={filtroDisponibilidade}
          onChange={e => setFiltroDisponibilidade(e.target.value)}
        >
          <option value="">Disponibilidade</option>
          <option>Hoje</option>
          <option>Esta semana</option>
          <option>Este mês</option>
        </select>
        {/* Botão de buscar opcional agora, pois filtro é ao digitar */}
        {/* <button>Buscar</button> */}
      </div>

      <div className="resultado-chefs">
        {resultado.length > 0 ? (
          resultado.map(prof => (
            <div className="chef-card" key={prof.id}>
              <img src={prof.imagem} alt={prof.nome} />
              <h3>{prof.nome}</h3>
              <p>Especialidade: {prof.especialidade}</p>
              <p>Cidade: {prof.cidade}</p>
              <p>Avaliação: ⭐ {prof.avaliacao}</p>
              <Link to={`/perfil/${prof.id}`}>
                <button>Ver Perfil</button>
              </Link>
            </div>
          ))
        ) : (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            Nenhum profissional encontrado com esses filtros.
          </p>
        )}
      </div>
    </div>
  )
}
