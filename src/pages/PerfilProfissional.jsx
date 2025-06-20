import React from 'react'
import { useParams } from 'react-router-dom'
import './PerfilProfissional.css'

const profissionaisMock = [
  {
    id: '1',
    nome: 'João Silva',
    especialidade: 'Churrasqueiro Profissional',
    cidade: 'São Paulo',
    avaliacao: 4.7,
    descricao: 'Mais de 10 anos de experiência em eventos e restaurantes renomados. Trabalho com cortes nobres e preparo em domicílio.',
    imagem: 'https://i.pravatar.cc/300?img=1'
  },
  {
    id: '2',
    nome: 'Ana Oliveira',
    especialidade: 'Garçonete de Eventos',
    cidade: 'Rio de Janeiro',
    avaliacao: 4.9,
    descricao: 'Atuação em grandes eventos e casamentos. Simpática, organizada e com foco total no atendimento ao cliente.',
    imagem: 'https://i.pravatar.cc/300?img=2'
  }
]

export default function PerfilProfissional() {
  const { id } = useParams()
  const profissional = profissionaisMock.find(p => p.id === id)

  if (!profissional) {
    return <div className="perfil-container">Profissional não encontrado.</div>
  }

  return (
    <div className="perfil-container">
      <div className="perfil-card">
        <img src={profissional.imagem} alt={profissional.nome} className="perfil-foto" />
        <h2>{profissional.nome}</h2>
        <p><strong>Especialidade:</strong> {profissional.especialidade}</p>
        <p><strong>Cidade:</strong> {profissional.cidade}</p>
        <p><strong>Avaliação:</strong> ⭐ {profissional.avaliacao.toFixed(1)}</p>
        <p className="perfil-descricao">{profissional.descricao}</p>
      </div>
    </div>
  )
}
