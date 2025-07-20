// MenuInferiorFreela.jsx
import React from "react";
import { FaPhoneAlt, FaCalendarAlt, FaBriefcase, FaCog } from "react-icons/fa";

const MenuInferiorFreela = ({ onSelect }) => {
  return (
    <div className="flex justify-around items-center bg-white rounded-xl shadow-md p-3 mt-4">
      <button onClick={() => onSelect("chamadas")} className="flex flex-col items-center">
        <FaPhoneAlt className="text-xl" />
        <span className="text-xs mt-1">Chamadas</span>
      </button>
      <button onClick={() => onSelect("eventos")} className="flex flex-col items-center">
        <FaCalendarAlt className="text-xl" />
        <span className="text-xs mt-1">Eventos</span>
      </button>
      <button onClick={() => onSelect("vagas")} className="flex flex-col items-center">
        <FaBriefcase className="text-xl" />
        <span className="text-xs mt-1">Vagas</span>
      </button>
      <button onClick={() => onSelect("config")} className="flex flex-col items-center">
        <FaCog className="text-xl" />
        <span className="text-xs mt-1">Config</span>
      </button>
    </div>
  );
};

export default MenuInferiorFreela;
