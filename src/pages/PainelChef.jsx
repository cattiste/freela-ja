// src/pages/PainelChef.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import avatar from '../assets/avatar.png';
import alarme from '../assets/alarme.mp3';

const vagasMock = [
  { id: 1, titulo: 'Garçom em evento - São Paulo', status: 'Disponível' },
  { id: 2, titulo: 'Cozinheiro para buffet - ABC', status: 'Disponível' },
  { id: 3, titulo: 'Barista freelance - Centro SP', status: 'Disponível' },
];

export default function PainelChef() {
  const navigate = useNavigate();
  const [candidaturas, setCandidaturas] = useState([]);
  const [vagas, setVagas] = useState(vagasMock);

  const tocarAlarme = () => {
    const audio = new Audio(alarme);
    audio.play();
  };

  useEffect(() => {
    const salvas = JSON.parse(localStorage.getItem('candidaturas')) || [];
    setCandidaturas(salvas);
  }, []);

  const candidatar = (vaga) => {
    const novas = [...candidaturas, vaga];
    setCandidaturas(novas);
    localStorage.setItem('candidaturas', JSON.stringify(novas));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-orange-200 text-gray-800 p-4">
      <div className="flex flex-col items-start mb-6">
        <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full" />
        <h2 className="text-xl font-bold mt-2">Bruno Free</h2>
        <p className="text-sm text-gray-700">Chef de Cozinha</p>
        <p className="text-sm mt-1">📧 bruno.cattiste@gmail.com</p>
        <p className="text-sm">📞</p>
        <div className="flex gap-2 mt-3">
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => alert('Editar perfil')}>Editar Perfil</button>
          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => navigate('/')}>Sair</button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">📄 Vagas Disponíveis</h3>
        <ul className="space-y-3">
          {vagas.map((vaga) => (
            <li key={vaga.id} className="bg-white shadow-md p-3 rounded">
              <p className="font-medium">{vaga.titulo}</p>
              <p className="text-green-600 text-sm mb-2">{vaga.status}</p>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                onClick={() => candidatar(vaga)}
              >
                Candidatar-se
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">✅ Minhas Candidaturas</h3>
        {candidaturas.length === 0 ? (
          <p className="text-sm text-gray-600">Você ainda não se candidatou a nenhuma vaga.</p>
        ) : (
          <ul className="space-y-2">
            {candidaturas.map((vaga, index) => (
              <li key={index} className="bg-white shadow-sm p-2 rounded text-sm">
                {vaga.titulo}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center gap-2"
        onClick={tocarAlarme}
      >
        ⚠️ Testar Alarme
      </button>
    </div>
  );
}
