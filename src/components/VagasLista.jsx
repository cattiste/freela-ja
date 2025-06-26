// src/components/VagasLista.jsx
import React, { useEffect, useState } from 'react'

export default function VagasLista() {
  const [vagas, setVagas] = useState([])

  useEffect(() => {
    const vagasSalvas = JSON.parse(localStorage.getItem('vagas') || '[]')
    setVagas(vagasSalvas)
  }, [])

  if (vagas.length === 0) {
    return <p>Nenhuma vaga disponível no momento.</p>
  }

  return (
    <div className="grid gap-4">
      {vagas.map(vaga => (
        <div key={vaga.id} className="bg-white p-4 rounded shadow">
          <h3 className="font-bold text-lg">{vaga.titulo}</h3>
          <p>{vaga.descricao}</p>
          <p className="text-sm text-gray-600 mt-1">Local: {vaga.local}</p>
          {vaga.salario && <p className="text-sm text-green-600">Salário: {vaga.salario}</p>}
        </div>
      ))}
    </div>
  )
}
