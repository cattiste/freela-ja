import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import UploadImagem from '../components/UploadImagem'

export default function EditarFreela() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const docRef = doc(db, 'usuarios', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setFreela(docSnap.data())
        } else {
          setError('Freelancer não encontrado.')
        }
      } catch (err) {
        setError('Erro ao carregar dados.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFreela((prev) => ({ ...prev, [name]: value }))
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    try {
      const docRef = doc(db, 'usuarios', id)
      await updateDoc(docRef, {
        nome: freela.nome,
        celular: freela.celular,
        endereco: freela.endereco,
        funcao: freela.funcao,
        especialidades: freela.especialidades,
        valorDiaria: parseFloat(freela.valorDiaria),
        foto: freela.foto,
      })
      alert('Dados atualizados com sucesso!')
      navigate('/painelfreela')
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar as alterações.')
    }
  }

  if (loading) return <p className="text-center mt-10">Carregando...</p>
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">✏️ Editar Perfil Freelancer</h1>
      <form onSubmit={handleSalvar} className="flex flex-col gap-4">
        <input
          type="text"
          name="nome"
          value={freela.nome || ''}
          onChange={handleChange}
          placeholder="Nome"
          className="input-field"
          required
        />
        <input
          type="text"
          name="celular"
          value={freela.celular || ''}
          onChange={handleChange}
          placeholder="Celular"
          className="input-field"
          required
        />
        <input
          type="text"
          name="endereco"
          value={freela.endereco || ''}
          onChange={handleChange}
          placeholder="Endereço"
          className="input-field"
          required
        />
        <input
          type="text"
          name="funcao"
          value={freela.funcao || ''}
          onChange={handleChange}
          placeholder="Função"
          className="input-field"
          required
        />
        <input
          type="text"
          name="especialidades"
          value={freela.especialidades || ''}
          onChange={handleChange}
          placeholder="Especialidades"
          className="input-field"
          required
        />
        <input
          type="number"
          name="valorDiaria"
          value={freela.valorDiaria || ''}
          onChange={handleChange}
          placeholder="Valor da Diária"
          className="input-field"
          required
        />

        <UploadImagem onUploadComplete={(url) => setFreela((prev) => ({ ...prev, foto: url }))} />

        <button
          type="submit"
          className="btn-primary mt-4"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  )
}
