import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export default function SalvarSenhaCartao() {
  const { usuario } = useAuth();
  const [senha, setSenha] = useState('');

  const handleSalvarSenha = async () => {
    if (!senha) {
      toast.error('Informe a senha');
      return;
    }

    try {
      const functions = getFunctions(getApp());
      const salvarSenha = httpsCallable(functions, 'salvarSenha');
      await salvarSenha({ uid: usuario.uid, senhaPagamento: senha });

      toast.success('💳 Senha salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar senha:', error);
      toast.error('Erro ao salvar senha do cartão.');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-orange-300 mt-4">
      <h3 className="text-lg font-bold text-orange-700 mb-2">🔐 Definir Senha do Cartão</h3>
      <input
        type="password"
        placeholder="Senha de pagamento"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="w-full border p-2 rounded mb-2"
      />
      <button
        onClick={handleSalvarSenha}
        className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
      >
        Salvar Senha
      </button>
    </div>
  );
}
