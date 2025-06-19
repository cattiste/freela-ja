import React from 'react';

export default function Register() {
  return (
    <div className="max-w-xl mx-auto mt-20">
      <h2 className="text-2xl font-semibold mb-4">Cadastro</h2>
      <form className="space-y-4">
        <input type="text" placeholder="Nome" className="w-full border p-2 rounded" />
        <input type="email" placeholder="E-mail" className="w-full border p-2 rounded" />
        <select className="w-full border p-2 rounded">
          <option>Sou Profissional</option>
          <option>Sou Empresa</option>
        </select>
        <button className="bg-red-600 text-white py-2 px-4 rounded">Cadastrar</button>
      </form>
    </div>
  );
}