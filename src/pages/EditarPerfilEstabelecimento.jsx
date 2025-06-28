import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export default function EditarPerfilEstabelecimento() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    cnpj: '',
    categoria: ''
  })
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setErro('Usuário não autenticado.')
        setCarregando(false)
        return
      }

      try {
        const docRef = doc(db, 'usuarios', user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          if (data.tipo !== 'estabelecimento') {
            setErro('Apenas estabelecimentos podem acessar essa página.')
          } else {
            setForm({
              nome: data.nome || '',
              email: user.email || '',
              telefone: data.telefone || '',
              endereco: data.endereco || '',
              cidade: data.cidade || '',
              cnpj: data.cnpj || '',
              categoria: data.categoria || ''
            })
          }
        } else {
          setErro('Perfil não encontrado.')
        }
      } catch (err) {
        console.error(err)
        setErro('Erro ao carregar dados.')
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro(null)
    setSucesso(null)

    // Validação simples
    if (!form.nome.trim()) {
      setErro('O campo nome é obrigatório.')
      return
    }
    if (form.cnpj && form.cnpj.length < 14) {
      setErro('CNPJ inválido, deve ter 14 caracteres.')
      return
    }

    setCarregando(true)
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Usuário não autenticado.')

      const docRef = doc(db, 'usuarios', user.uid)
      await updateDoc(docRef, {
        nome: form.nome,
        telefone: form.telefone,
        endereco: form.endereco,
        cidade: form.cidade,
        cnpj: form.cnpj,
        categoria: form.categoria
      })

      setSucesso('Perfil atualizado com sucesso!')
    } catch (err) {
      console.error(err)
      setErro('Erro ao atualizar perfil: ' + err.message)
    } finally {
      setCarregando(false)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-orange-600">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">Editar Perfil do Estabelecimento</h2>

        {erro && <p className="mb-4 text-red-600 text-center font-semibold">{erro}</p>}
        {sucesso && <p className="mb-4 text-green-600 text-center font-semibold">{sucesso}</p>}

        <label className="block mb-1 text-sm font-semibold">Nome</label>
        <input
          name="nome"
          type="text"
          value={form.nome}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        <label className="block mb-1 text-sm font-semibold">E-mail (não editável)</label>
        <input
          type="email"
          value={form.email}
          disabled
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
        />

        <label className="block mb-1 text-sm font-semibold">Telefone</label>
        <input
          name="telefone"
          type="text"
          value={form.telefone}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <label className="block mb-1 text-sm font-semibold">Endereço</label>
        <input
          name="endereco"
          type="text"
          value={form.endereco}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <label className="block mb-1 text-sm font-semibold">Cidade</label>
        <input
          name="cidade"
          type="text"
          value={form.cidade}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <label className="block mb-1 text-sm font-semibold">CNPJ</label>
        <input
          name="cnpj"
          type="text"
          value={form.cnpj}
          onChange={handleChange}
          placeholder="Somente números, 14 dígitos"
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <label className="block mb-1 text-sm font-semibold">Categoria</label>
        <input
          name="categoria"
          type="text"
          value={form.categoria}
          onChange={handleChange}
          className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button
          type="submit"
          disabled={carregando}
          className={`w-full py-2 rounded text-white font-semibold transition ${
            carregando ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {carregando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  )
}
