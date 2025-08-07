// ✅ CadastroPessoaFisica.jsx corrigido
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function CadastroPessoaFisica() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '', endereco: '', foto: '' });
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'preset-publico');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dbemvuau3/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) setForm({ ...form, foto: data.secure_url });
    } catch (error) {
      toast.error('Erro ao enviar foto');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const credenciais = await createUserWithEmailAndPassword(auth, form.email, form.senha);
      await setDoc(doc(db, 'usuarios', credenciais.user.uid), {
        uid: credenciais.user.uid,
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        endereco: form.endereco,
        foto: form.foto || '',
        tipo: 'pessoa_fisica',
        criadoEm: serverTimestamp(),
      });
      toast.success('Cadastro realizado com sucesso!');
      navigate('/pf');
    } catch (err) {
      toast.error('Erro ao cadastrar: ' + err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600891964599-f61ba0e24092)' }}>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4 text-center">Cadastro Pessoa Física</h1>

        <input type="text" name="nome" placeholder="Nome completo" className="campo" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" className="campo" onChange={handleChange} required />
        <input type="password" name="senha" placeholder="Senha" className="campo" onChange={handleChange} required />
        <input type="text" name="telefone" placeholder="Telefone" className="campo" onChange={handleChange} required />
        <input type="text" name="endereco" placeholder="Endereço" className="campo" onChange={handleChange} required />

        <label className="block text-sm mt-4 mb-1 font-medium text-gray-700">Foto de Perfil:</label>
        <input type="file" accept="image/*" onChange={handleFoto} className="mb-4" />
        {form.foto && <img src={form.foto} alt="Prévia da foto" className="w-24 h-24 object-cover rounded-full border mx-auto" />}

        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded mt-4" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}
