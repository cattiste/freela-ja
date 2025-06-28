<<<<<<< HEAD
// src/components/VagasLista.jsx
=======
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
import React, { useEffect, useState } from 'react'

export default function VagasLista() {
  const [vagas, setVagas] = useState([])

  useEffect(() => {
    const vagasSalvas = JSON.parse(localStorage.getItem('vagas') || '[]')
    setVagas(vagasSalvas)
  }, [])

  if (vagas.length === 0) {
<<<<<<< HEAD
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
=======
    return (
      <p className="text-center text-gray-500 mt-8">
        Nenhuma vaga disponível no momento.
      </p>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vagas.map(vaga => (
        <div
          key={vaga.id}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h3 className="font-bold text-xl mb-2">{vaga.titulo}</h3>
          <p className="text-gray-700 mb-3">{vaga.descricao}</p>
          <p className="text-sm text-gray-600 mb-1">Local: {vaga.local}</p>
          {vaga.salario && (
            <p className="text-sm text-green-600 font-semibold">
              Salário: {vaga.salario}
            </p>
          )}
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
        </div>
      ))}
    </div>
  )
}
