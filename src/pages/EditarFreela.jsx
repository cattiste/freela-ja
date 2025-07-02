import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function EditarFreela() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState({
    nome: '',
    funcao: '',
    email: '',
    celular: '',
    endereco: '',
    valorDiaria: '',
    tipoContrato: '',
    foto: ''
  })
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!id) {
      alert('ID do freelancer não encontrado.')
      navigate('/login')
      return
    }

    const fetchDados = async () => {
      try {
        const docRef = doc(db, 'usuarios', id)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setForm(snap.data())
        } else {
          alert('Freelancer não encontrado.')
          navigate('/login')
        }
      } catch (err) {
        console.error(err)
        alert('Erro ao buscar dados.')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchDados()
  }, [id, navigate])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSalvando(true)
    try {
      const docRef = doc(db, 'usuarios', id)
      await updateDoc(docRef, form)
      alert('Perfil atualizado com sucesso!')
      navigate('/painelfreela')
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar perfil.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  return (
    <div className="min-h-screen bg-blue-50 p-6 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Editar Perfil Freelancer</h1>
        {['nome', 'funcao', 'email', 'celular', 'endereco', 'valorDiaria', 'tipoContrato', 'foto'].map(campo => (
          <label key={campo} className="block mb-3">
            {campo.charAt(0).toUpperCase() + campo.slice(1)}
            <input
              type={campo === 'email' ? 'email' : campo === 'valorDiaria' ? 'number' : 'text'}
              name={campo}
              value={form[campo]}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
            />
          </label>
        ))}
        <button
          type="submit"
          disabled={salvando}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {salvando ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </div>
  )
}
