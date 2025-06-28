import React from 'react'

export default function PublicarVaga({ estabelecimento }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📢 Publicar Nova Vaga</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Título da Vaga" className="w-full p-2 border rounded" />
        <textarea placeholder="Descrição" className="w-full p-2 border rounded" />
        <input type="text" placeholder="Local" className="w-full p-2 border rounded" />
        <input type="number" placeholder="Pagamento (R$)" className="w-full p-2 border rounded" />
        <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
          Publicar Vaga
        </button>
      </form>
    </div>
  )
}
