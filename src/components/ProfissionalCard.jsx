import React from 'react'
<<<<<<< HEAD
import './ProfissionalCard.css'

export default function ProfissionalCard({ prof }) {
  return (
    <div className="card-profissional">
      <img src={prof.imagem} alt={prof.nome} className="card-foto" />
      <h3>{prof.nome}</h3>
      <p><strong>Especialidade:</strong> {prof.especialidade}</p>
      <p><strong>Cidade:</strong> {prof.cidade}</p>
      <p><strong>Avaliação:</strong> ⭐ {prof.avaliacao.toFixed(1)}</p>
      <p className="descricao">{prof.descricao}</p>
      <button className="card-botao">📩 Chamar</button>
=======

export default function ProfissionalCard({ prof, onChamar }) {
  const imagemValida =
    typeof prof.imagem === 'string' && prof.imagem.trim() !== ''
      ? prof.imagem
      : 'https://i.imgur.com/3W8i1sT.png'

  const diariaNumerica = !isNaN(parseFloat(prof.valorDiaria))

  return (
    <div className="bg-white rounded-2xl p-5 m-4 max-w-xs shadow-md text-center transition-transform duration-200 hover:-translate-y-1">
      <img
        src={imagemValida}
        alt={prof.nome || 'Profissional'}
        className="w-24 h-24 rounded-full object-cover mb-3 mx-auto border-2 border-orange-400 shadow"
      />

      <h3 className="text-lg font-bold text-gray-800">
        {prof.nome || 'Nome não informado'}
      </h3>

      <p className="text-gray-700 mt-1">
        <strong>Função:</strong> {prof.especialidade || 'Não informado'}
      </p>

      <p className="text-gray-700 mt-1">
        <strong>Endereço:</strong> {prof.endereco || 'Não informado'}
      </p>

      <p className="text-yellow-500 mt-1">
        <strong>Avaliação:</strong>{' '}
        {typeof prof.avaliacao === 'number'
          ? `⭐ ${prof.avaliacao.toFixed(1)}`
          : 'N/A'}
      </p>

      {diariaNumerica && (
        <p className="text-green-600 font-semibold mt-1">
          <strong>💸 Diária:</strong> R$ {parseFloat(prof.valorDiaria).toFixed(2)}
        </p>
      )}

      {prof.descricao && (
        <p className="italic mt-2 text-sm text-gray-600">
          {prof.descricao}
        </p>
      )}

      {onChamar && (
        <button
          onClick={() => onChamar(prof)}
          className="bg-green-600 text-white py-2 px-4 rounded-xl mt-4 hover:bg-green-700 cursor-pointer transition-colors duration-200"
        >
          📩 Chamar
        </button>
      )}
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    </div>
  )
}
