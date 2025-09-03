
import React, { useEffect, useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CartoesContratante() {
  const { usuario } = useAuth();
  const [cartoes, setCartoes] = useState([]);
  const [abrirCadastro, setAbrirCadastro] = useState(false);
  const [form, setForm] = useState({
    titular: '',
    numero: '',
    validade: '',
    cvv: ''
  });

  useEffect(() => {
    if (!usuario?.uid) return;
    listarCartoes();
  }, [usuario?.uid]);

  const listarCartoes = async () => {
    try {
      const functions = getFunctions(getApp());
      const listar = httpsCallable(functions, 'listarCartao');
      const res = await listar({ uid: usuario.uid });
      if (res.data) setCartoes([res.data]);
    } catch (err) {
      console.error('Erro ao listar cartões:', err);
      toast.error('Erro ao listar cartões.');
    }
  };

  const salvarCartao = async () => {
    try {
      const functions = getFunctions(getApp());
      const cadastrar = httpsCallable(functions, 'cadastrarCartao');
      await cadastrar({ ...form, uid: usuario.uid });
      toast.success('✅ Cartão salvo com sucesso!');
      setAbrirCadastro(false);
      listarCartoes();
    } catch (err) {
      console.error('Erro ao salvar cartão:', err);
      toast.error('Erro ao salvar cartão.');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-orange-700">💳 Meus Cartões</h3>
        <button
          onClick={() => setAbrirCadastro(true)}
          className="text-sm bg-orange-600 text-white px-3 py-1 rounded"
        >
          + Adicionar Cartão
        </button>
      </div>
      {cartoes.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhum cartão cadastrado.</p>
      ) : (
        cartoes.map((c, i) => (
          <p key={i} className="text-sm text-gray-700">
            Cartão final <span className="font-semibold">{c.numeroFinal}</span> ({c.bandeira})
          </p>
        ))
      )}

      {abrirCadastro && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-700">Cadastrar Cartão</h3>
              <button onClick={() => setAbrirCadastro(false)}>✕</button>
            </div>
            <input
              type="text"
              placeholder="Titular"
              className="border p-2 rounded w-full"
              value={form.titular}
              onChange={(e) => setForm({ ...form, titular: e.target.value })}
            />
            <input
              type="text"
              placeholder="Número"
              className="border p-2 rounded w-full"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
            />
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Validade"
                className="border p-2 rounded w-full"
                value={form.validade}
                onChange={(e) => setForm({ ...form, validade: e.target.value })}
              />
              <input
                type="text"
                placeholder="CVV"
                className="border p-2 rounded w-full"
                value={form.cvv}
                onChange={(e) => setForm({ ...form, cvv: e.target.value })}
              />
            </div>
            <button
              className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
              onClick={salvarCartao}
            >
              Salvar Cartão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
