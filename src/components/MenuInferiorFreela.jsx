// MenuInferiorFreela.jsx
import React from "react";
import { FaUser, FaStar, FaHistory } from "react-icons/fa";

const MenuInferiorFreela = ({ onSelect, abaAtiva }) => {
  const iconeClasse = (nome) =>
    `flex flex-col items-center flex-1 py-2 ${
      abaAtiva === nome ? "text-blue-600 font-bold" : "text-gray-500"
    }`;

  return (
    <div className="flex justify-around items-center bg-white rounded-t-2xl shadow-lg px-4">
      <button onClick={() => onSelect("perfil")} className={iconeClasse("perfil")}>
        <FaUser className="text-xl" />
        <span className="text-xs">Perfil</span>
      </button>
      <button onClick={() => onSelect("avaliacoes")} className={iconeClasse("avaliacoes")}>
        <FaStar className="text-xl" />
        <span className="text-xs">Avaliações</span>
      </button>
      <button onClick={() => onSelect("historico")} className={iconeClasse("historico")}>
        <FaHistory className="text-xl" />
        <span className="text-xs">Histórico</span>
      </button>
    </div>
  );
};

export default MenuInferiorFreela;
