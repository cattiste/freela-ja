// src/pages/Perfil.jsx
import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './perfilprofissional.css'

const profissionais = [
  {
    id: '1',
    nome: 'João Silva',
    especialidade: 'Churrasqueiro Profissional',
    cidade: 'São Paulo',
    imagem: 'https://i.pravatar.cc/300?img=1',
    avaliacao: 4.7,
    descricao: 'Experiência em grandes eventos, casamentos e festas corporativas.'
  },
  {
    id: '2',
    nome: 'Ana Oliveira',
    especialidade: 'Garçonete de Eventos',
    cidade: 'Rio de Janeiro',
    imagem: 'https://i.pravatar.cc/300?img=2',
    avaliacao: 4.9,
    descricao: 'Atendimento impecável com simpatia e profissionalismo.'
  },
  {
    id: '3',
    nome: 'Carlos Pereira',
    especialidade: 'Segurança Privado',
    cidade: 'Campinas',
    imagem: 'https://i.pravatar.cc/300?img=3',
    avaliacao: 4.6,
    descricao: 'Especializado em segurança de festas VIP e controle de acesso.'
  },
  {
    id: '4',
    nome: 'Marina Dias',
    especialidade: 'Bartender Profissional',
    cidade: 'São Paulo',
    imagem: 'https://i.pravatar.cc/300?img=4',
    avaliacao: 4.8,
    descricao: 'Drinks exclusivos com apresentação artística e experiência de bar show.'
  }
]

export default function Perfil() {
  const { id } = useParams()
  const navigate = useNavigate()

  const profissional = profissionais.find(p => p.id === id)

  if (!profissional) {
    return <div className="perfil-container">Profissional não encontrado.</div>
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <img src={profissional.imagem} alt={profissional.nome} />
        <div className="perfil-info">
          <h2>{profissional.nome}</h2>
          <p><strong>Especialidade:</strong> {profissional.especialidade}</p>
          <p><strong>Cidade:</strong> {profissional.cidade}</p>
          <p className="perfil-avaliacao">⭐ {profissional.avaliacao}</p>
        </div>
      </div>

      <p>{profissional.descricao}</p>

      <button className="botao-voltar" onClick={() => navigate(-1)}>
        Voltar
      </button>
    </div>
  )
}
