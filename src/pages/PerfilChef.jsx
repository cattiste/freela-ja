import React from 'react'
import { useParams } from 'react-router-dom'
import './PerfilChef.css'

export default function PerfilChef() {
  const { nome } = useParams()

  // Dados fictícios só para exibição (depois podemos puxar de um JSON)
  const dadosChef = {
    "joao-silva": {
      nome: "João Silva",
      especialidade: "Comida Italiana",
      cidade: "São Paulo",
      descricao: "Chef com 10 anos de experiência em pratos tradicionais italianos. Trabalha com massas artesanais e molhos caseiros.",
      foto: "https://via.placeholder.com/250"
    },
    "ana-oliveira": {
      nome: "Ana Oliveira",
      especialidade: "Sushi Tradicional",
      cidade: "Rio de Janeiro",
      descricao: "Especialista em sushis clássicos, com toque moderno. Formada no Japão e apaixonada por sabores equilibrados.",
      foto: "https://via.placeholder.com/250"
    }
  }

  const chef = dadosChef[nome]

  if (!chef) {
    return <p style={{ padding: '40px', textAlign: 'center' }}>Chef não encontrado.</p>
  }

  return (
    <div className="perfil-container">
      <img src={chef.foto} alt={chef.nome} className="perfil-foto" />
      <h2>{chef.nome}</h2>
      <p><strong>Especialidade:</strong> {chef.especialidade}</p>
      <p><strong>Cidade:</strong> {chef.cidade}</p>
      <p className="perfil-descricao">{chef.descricao}</p>
      <button className="btn-contratar">Contratar</button>
    </div>
  )
}
