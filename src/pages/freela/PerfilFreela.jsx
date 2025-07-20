import React from 'react';
import Agenda from './AgendaFreela';
import { FaPhone, FaCalendarAlt, FaStar, FaHistory } from 'react-icons/fa';

const PerfilFreela = () => {
  return (
    <div className="p-4 space-y-4">
      {/* Card com perfil e agenda lado a lado */}
      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* Card do freela */}
        <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center w-full md:w-1/2">
          <img
            src="https://placehold.co/120x120"
            alt="Foto do Freela"
            className="rounded-full w-28 h-28 object-cover mb-4"
          />
          <h2 className="text-xl font-bold">Nome do Freela</h2>
          <p className="text-sm text-gray-500">Função: Garçom</p>
          <p className="text-sm text-gray-500">Telefone: (11) 99999-9999</p>
          <p className="text-sm text-gray-500">Email: freela@email.com</p>
        </div>

        {/* Agenda */}
        <div className="bg-white rounded-2xl shadow-md p-4 w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-2">Agenda</h2>
          <Agenda />
        </div>
      </div>

      {/* Menu inferior de ícones */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="flex flex-col items-center">
          <FaPhone className="text-xl text-blue-600" />
          <span className="text-sm">Chamadas</span>
        </div>
        <div className="flex flex-col items-center">
          <FaCalendarAlt className="text-xl text-green-600" />
          <span className="text-sm">Eventos</span>
        </div>
        <div className="flex flex-col items-center">
          <FaStar className="text-xl text-yellow-500" />
          <span className="text-sm">Avaliações</span>
        </div>
        <div className="flex flex-col items-center">
          <FaHistory className="text-xl text-gray-600" />
          <span className="text-sm">Histórico</span>
        </div>
      </div>
    </div>
  );
};

export default PerfilFreela;
