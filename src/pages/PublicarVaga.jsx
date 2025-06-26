import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import './Home.css'

export default function PublicarVaga() {
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState('CLT')
  const [salario, setSalario] = useState('')
  const [descricao, setDescricao] = useState('')
  const [emailContato, setEmailContato] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!titulo || !empresa || !cidade || !salario || !descricao || !emailContato) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)

    const novaVaga = {
      titulo,
      empresa,
      cidade,
      tipo,
      salario,
      descricao,
      emailContato,
      data: new Date().toISOString()
    }

    try {
      await addDoc(collection(db, 'vagas'), novaVaga)
      alert('Vaga publicada com sucesso!')
      navigate('/painelestabelecimento') // Ajuste o caminho conforme seu projeto
    } catch (error) {
      alert('Erro ao publicar vaga: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="w-full max-w-md flex justify-between fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => navigate(-1)}
          className="botao-voltar-home"
          style={{ left: '20px', right: 'auto', position: 'fixed' }}
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="botao-voltar-home botao-home-painel"
          style={{ right: '20px', left: 'auto', position: 'fixed' }}
        >
          🏠 Home
        </button>
      </div>

      <div className="home-container">
        <h1 className="home-title">Publicar Vaga CLT</h1>
        <form onSubmit={handleSubmit} className="form-container">
          <input
            type="text"
            placeholder="Título da Vaga"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="input"
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Nome da Empresa"
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            className="input"
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Cidade"
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            className="input"
            required
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Salário"
            value={salario}
            onChange={e => setSalario(e.target.value)}
            className="input"
            required
            disabled={loading}
          />
          <textarea
            placeholder="Descrição da vaga"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            className="input"
            rows={4}
            required
            disabled={loading}
          />
          <input
            type="email"
            placeholder="E-mail para contato"
            value={emailContato}
            onChange={e => setEmailContato(e.target.value)}
            className="input"
            required
            disabled={loading}
          />

          <button type="submit" className="home-button" disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar Vaga'}
          </button>
        </form>
      </div>
    </>
  )
}
