import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import UploadImagem from '../components/UploadImagem'

export default function EditarFreela() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarDados() {
      const ref = doc(db, 'usuarios', id)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        const dados = snap.data()
        setNome(dados.nome || '')
        setCelular(dados.celular || '')
        setEndereco(dados.endereco || '')
        setFuncao(dados.funcao || '')
        setValorDiaria(dados.valorDiaria || '')
        setFoto(dados.foto || '')
      } else {
        alert('Freelancer não encontrado.')
        navigate('/login')
      }
      setLoading(false)
    }

    carregarDados()
  }, [id, navigate])

  const handleSalvar = async (e) => {
    e.preventDefault()

    try {
      const ref = doc(db, 'usuarios', id)
      await updateDoc(ref, {
        nome,
        celular,
        endereco,
        funcao,
        valorDiaria,
        foto,
        atualizadoEm: new Date()
      })

      alert('Perfil atualizado com sucesso!')
      navigate('/painelfreela')
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar dados.')
    }
  }

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">✏️ Editar Perfil Freelancer</h1>

      <form onSubmit={handleSalvar} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Celular"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="number"
          placeholder="Valor da Diária (R$)"
          value={valorDiaria}
          onChange={(e) => setValorDiaria(e.target.value)}
          className="input-field"
          required
        />

        <UploadImagem onUploadComplete={(url) => setFoto(url)} />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 px-5 rounded-full shadow-md mt-4"
        >
          💾 Salvar Alterações
        </button>
      </form>
    </div>
  )
}
