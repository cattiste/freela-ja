import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default function EditarFreela() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState({
    nome: '',
    email: '',
    funcao: '',
    foto: '', // URL da foto salva
    especialidade: '',
    endereco: '',
    descricao: '',
    diaria: '',
  })
  const [imagemPreview, setImagemPreview] = useState(null) // preview local da imagem antes de salvar
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function carregarDados() {
      try {
        if (!id) {
          setErro('ID inválido.')
          return
        }

        const freelaRef = doc(db, 'usuarios', id)
        const freelaSnap = await getDoc(freelaRef)

        if (!freelaSnap.exists()) {
          setErro('Freelancer não encontrado.')
          return
        }

        const dados = freelaSnap.data()
        setForm({
          nome: dados.nome || '',
          email: dados.email || '',
          funcao: dados.funcao || '',
          foto: dados.foto || '',
          especialidade: dados.especialidade || '',
          endereco: dados.endereco || '',
          descricao: dados.descricao || '',
          diaria: dados.diaria || '',
        })
        setImagemPreview(dados.foto || null)
      } catch (e) {
        console.error('Erro ao carregar dados:', e)
        setErro('Erro ao carregar perfil.')
      } finally {
        setCarregando(false)
      }
    }

    carregarDados()
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Função para lidar com seleção de arquivo local e mostrar preview
  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagemPreview(reader.result)
        // Aqui você pode decidir se vai salvar a imagem base64 direto no Firestore (não recomendado),
        // ou fazer upload em serviço externo e salvar a URL no Firebase.
        // Por enquanto, vamos guardar a base64 no campo foto só pra demonstrar.
        setForm(prev => ({ ...prev, foto: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setCarregando(true)
      const freelaRef = doc(db, 'usuarios', id)

      await updateDoc(freelaRef, { ...form })

      alert('Perfil atualizado com sucesso!')
      navigate('/painelfreela')
    } catch (e) {
      console.error('Erro ao atualizar perfil:', e)
      alert('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 text-blue-700 font-semibold text-xl">
        Carregando...
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-600 font-bold text-xl">
        {erro}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-lg max-w-lg w-full p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">Editar Perfil</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome, email, função ... */}

          <div>
            <label className="block font-semibold mb-1" htmlFor="nome">Nome completo</label>
            <input
              type="text"
              name="nome"
              id="nome"
              value={form.nome}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Seu nome completo"
            />
          </div>

          {/* resto dos campos ... */}

          <div>
            <label className="block font-semibold mb-1" htmlFor="foto">Foto de Perfil</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
            {imagemPreview && (
              <img
                src={imagemPreview}
                alt="Preview"
                className="mt-3 w-32 h-32 object-cover rounded-full border-2 border-blue-400 shadow"
              />
            )}
          </div>

          {/* outros inputs */}

          <div>
            <label className="block font-semibold mb-1" htmlFor="funcao">Função / Cargo</label>
            <input
              type="text"
              name="funcao"
              id="funcao"
              value={form.funcao}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ex: Cozinheiro, Garçom"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" htmlFor="especialidade">Especialidade</label>
            <input
              type="text"
              name="especialidade"
              id="especialidade"
              value={form.especialidade}
              onChange={handleChange}
              placeholder="Ex: Sushi, Buffet"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" htmlFor="endereco">Endereço</label>
            <input
              type="text"
              name="endereco"
              id="endereco"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Cidade, bairro, rua..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" htmlFor="descricao">Descrição</label>
            <textarea
              name="descricao"
              id="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={4}
              placeholder="Descreva suas habilidades, experiência..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1" htmlFor="diaria">Valor da diária (ex: R$ 150)</label>
            <input
              type="text"
              name="diaria"
              id="diaria"
              value={form.diaria}
              onChange={handleChange}
              placeholder="Quanto você cobra por dia"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={carregando || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition"
          >
            {carregando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}
