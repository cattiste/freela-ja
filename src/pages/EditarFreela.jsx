import React, { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
import { db } from '../firebase'
import UploadImagem from '../components/UploadImagem'

export default function EditarFreela() {
  const { uid } = useParams()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [celular, setCelular] = useState('')
  const [endereco, setEndereco] = useState('')
  const [funcao, setFuncao] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [foto, setFoto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function carregarDados() {
      const docRef = doc(db, 'usuarios', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const dados = docSnap.data()
        setNome(dados.nome || '')
        setEmail(dados.email || '')
        setCelular(dados.celular || '')
        setEndereco(dados.endereco || '')
        setFuncao(dados.funcao || '')
        setValorDiaria(dados.valorDiaria ? dados.valorDiaria.toString() : '')
        setFoto(dados.foto || '')
      } else {
        alert('Usuário não encontrado.')
        navigate('/')
      }
    }

    carregarDados()
  }, [uid, navigate])

  const handleSalvar = async (e) => {
    e.preventDefault()

    if (!nome || !email || !celular || !endereco || !funcao || !valorDiaria) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const docRef = doc(db, 'usuarios', uid)
      await updateDoc(docRef, {
        nome,
        email,
        celular,
        endereco,
        funcao,
        valorDiaria: parseFloat(valorDiaria),
        foto
      })

      alert('Perfil atualizado com sucesso!')
      navigate('/painelfreela')
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      setError('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-600">Editar Perfil Freelancer</h1>

      <form onSubmit={handleSalvar} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field"
          required
          disabled
          title="Email não pode ser alterado"
        />
        <input
          type="text"
          placeholder="Celular"
          value={celular}
          onChange={e => setCelular(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={endereco}
          onChange={e => setEndereco(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="text"
          placeholder="Função"
          value={funcao}
          onChange={e => setFuncao(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="number"
          placeholder="Valor da Diária"
          value={valorDiaria}
          onChange={e => setValorDiaria(e.target.value)}
          className="input-field"
          required
        />

        <UploadImagem onUploadComplete={url => setFoto(url)} currentImage={foto} />

        {error && <p className="text-red-600 text-center mt-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-4"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  )
}
