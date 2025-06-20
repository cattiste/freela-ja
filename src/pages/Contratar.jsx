import React from 'react'
import './Contratar.css'

export default function Contratar() {
  return (
    <div className="contratar-container">
      <h2 className="contratar-title">Painel de Profissionais</h2>
      <p className="contratar-subtitle">Encontre o profissional ideal para seu negócio</p>

      <div className="filtros-container">
        <input type="text" placeholder="Profissão (ex: Garçom, Chef, Segurança...)" />
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
          <h3>João Silva</h3>
          <p>Profissão: Garçom</p>
          <p>Cidade: São Paulo</p>
          <button>Ver Perfil</button>
        </div>

        <div className="chef-card">
          <h3>Ana Oliveira</h3>
          <p>Profissão: Chef de Cozinha</p>
          <p>Cidade: Rio de Janeiro</p>
          <button>Ver Perfil</button>
        </div>

        <div className="chef-card">
          <h3>Carlos Mendes</h3>
          <p>Profissão: Segurança</p>
          <p>Cidade: Belo Horizonte</p>
          <button>Ver Perfil</button>
        </div>
      </div>
    </div>
  )
}
