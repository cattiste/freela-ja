import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export default function CadastroEstabelecimento() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [categoria, setCategoria] = useState('')
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)

  const navigate = useNavigate()

  const handleCadastro = async (e) => {
    e.preventDefault()
    setErro(null)
    setCarregando(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      await setDoc(doc(db, 'usuarios', user.uid), {
        nome,
        email,
        tipo: 'estabelecimento',
        telefone,
        endereco,
        cidade,
        cnpj,
        categoria,
        criadoEm: new Date()
      })

      navigate('/painelestabelecimento')
    } catch (err) {
      console.error(err)
      setErro('Erro ao cadastrar: ' + err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <form 
        onSubmit={handleCadastro} 
        className="bg-white shadow-md rounded-xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-orange-700 mb-6">Cadastro de Estabelecimento</h2>

        {erro && <p className="mb-4 text-red-600">{erro}</p>}

        <label className="block mb-1 text-sm">Nome do Estabelecimento</label>
        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full mb-3 px-4 py-2 border rounded-lg" />

        <label className="block mb-1 text-sm">E-mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full mb-3 px-4 py-2 border rounded-lg" />

        <label className="block mb-1 text-sm">Senha</label>
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required className="w-full mb-3 px-4 py-2 border rounded-lg" />

        <label className="block mb-1 text-sm">Telefone</label>
        <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required className="w-full mb-3 px-4 py-2 border rounded-lg" />

        <label className="block mb-1 text-sm">Endereço</label>
        <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required className="w-full mb-3 px-4 py-2 border rounded-lg" />

        <label className="block mb-1 text-sm">Cidade</label>
        <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} required className="w-full mb-3 px-4 py-2 border rounded-lg" />

        <label className="block mb-1 text-sm">CNPJ</label>
        <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required className="w-full mb-3 px-4 py-2 border rounded-lg" />

        <label className="block mb-1 text-sm">Categoria (Ex: Restaurante, Bar, Hotel...)</label>
        <input type="text" value={categoria} onChange={(e) => setCategoria(e.target.value)} required className="w-full mb-6 px-4 py-2 border rounded-lg" />

        <button 
          type="submit" 
          disabled={carregando}
          className="w-full bg-orange-600 text-white font-semibold py-2 rounded hover:bg-orange-700 transition"
        >
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
