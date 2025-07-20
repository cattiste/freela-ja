import React from "react"
import {
  FaPhoneAlt,
  FaCalendarAlt,
  FaBriefcase,
  FaCog,
  FaHome,
  FaHistory
} from "react-icons/fa"

const MenuInferiorFreela = ({ onSelect }) => {
  return (
    <div className="flex justify-around items-center bg-white rounded-xl shadow-md p-3 mt-6 fixed bottom-4 left-4 right-4 z-50">
      <button onClick={() => onSelect("perfil")} className="flex flex-col items-center text-sm">
        <FaHome className="text-xl" />
        <span className="text-xs mt-1">Perfil</span>
      </button>
      <button onClick={() => onSelect("chamadas")} className="flex flex-col items-center text-sm">
        <FaPhoneAlt className="text-xl" />
        <span className="text-xs mt-1">Chamadas</span>
      </button>
      <button onClick={() => onSelect("eventos")} className="flex flex-col items-center text-sm">
        <FaCalendarAlt className="text-xl" />
        <span className="text-xs mt-1">Eventos</span>
      </button>
      <button onClick={() => onSelect("vagas")} className="flex flex-col items-center text-sm">
        <FaBriefcase className="text-xl" />
        <span className="text-xs mt-1">Vagas</span>
      </button>
      <button onClick={() => onSelect("historico")} className="flex flex-col items-center text-sm">
        <FaHistory className="text-xl" />
        <span className="text-xs mt-1">Histórico</span>
      </button>
      <button onClick={() => onSelect("config")} className="flex flex-col items-center text-sm">
        <FaCog className="text-xl" />
        <span className="text-xs mt-1">Config</span>
      </button>
    </div>
  )
}

export default MenuInferiorFreela
