<<<<<<< HEAD
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!titulo || !empresa || !cidade || !salario || !descricao || !emailContato) {
      alert('Preencha todos os campos obrigatórios.')
      return
    }

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
      navigate('/painelestabelecimento') // ou para onde quiser voltar
    } catch (error) {
      alert('Erro ao publicar vaga: ' + error.message)
=======
import React, { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PublicarVaga({ estabelecimento, vaga = null, onSucesso }) {
  const [tipoVaga, setTipoVaga] = useState('clt')
  const [titulo, setTitulo] = useState('')
  const [funcao, setFuncao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [empresa, setEmpresa] = useState(estabelecimento?.nome || '')
  const [emailContato, setEmailContato] = useState(estabelecimento?.email || '')
  const [cidade, setCidade] = useState('')
  const [salario, setSalario] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [datasAgendadas, setDatasAgendadas] = useState([])
  const [urgente, setUrgente] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (vaga) {
      setTipoVaga(vaga.tipoVaga || 'clt')
      setTitulo(vaga.titulo || '')
      setFuncao(vaga.funcao || '')
      setDescricao(vaga.descricao || '')
      setEmpresa(vaga.empresa || estabelecimento?.nome || '')
      setEmailContato(vaga.emailContato || estabelecimento?.email || '')
      setCidade(vaga.cidade || '')
      setSalario(vaga.salario ?? '')
      setValorDiaria(vaga.valorDiaria ?? '')
      setDatasAgendadas(
        vaga.datasAgendadas
          ? vaga.datasAgendadas.map(d =>
              d.seconds ? new Date(d.seconds * 1000).toISOString().substring(0, 10) : d
            )
          : []
      )
      setUrgente(vaga.urgente || false)
    } else {
      // Se for criação, limpa campos:
      setTipoVaga('clt')
      setTitulo('')
      setFuncao('')
      setDescricao('')
      setEmpresa(estabelecimento?.nome || '')
      setEmailContato(estabelecimento?.email || '')
      setCidade('')
      setSalario('')
      setValorDiaria('')
      setDatasAgendadas([])
      setUrgente(false)
      setError(null)
    }
  }, [vaga, estabelecimento])

  function toggleData(data) {
    if (datasAgendadas.includes(data)) {
      setDatasAgendadas(datasAgendadas.filter(d => d !== data))
    } else {
      setDatasAgendadas([...datasAgendadas, data])
    }
  }

  const opcoesDatas = ['2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04']

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!titulo || !funcao || !descricao || !empresa || !emailContato || !cidade) {
        throw new Error('Preencha todos os campos obrigatórios.')
      }

      if (tipoVaga === 'clt' && (!salario || Number(salario) <= 0)) {
        throw new Error('Informe um salário válido para vaga CLT.')
      }

      if (tipoVaga === 'freela' && (!valorDiaria || Number(valorDiaria) <= 0)) {
        throw new Error('Informe um valor de diária válido para vaga Freela.')
      }

      if (tipoVaga === 'freela' && datasAgendadas.length === 0) {
        throw new Error('Selecione pelo menos uma data para vaga Freela.')
      }

      const datasTimestamp = datasAgendadas.map(d => new Date(d))

      const dadosParaSalvar = {
        titulo,
        funcao,
        descricao,
        empresa,
        emailContato,
        cidade,
        tipoVaga,
        salario: tipoVaga === 'clt' ? Number(salario) : null,
        valorDiaria: tipoVaga === 'freela' ? Number(valorDiaria) : null,
        datasAgendadas: tipoVaga === 'freela' ? datasTimestamp : [],
        urgente,
        status: 'ativo',
        dataPublicacao: serverTimestamp(),
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome,
      }

      if (vaga && vaga.id) {
        const vagaRef = doc(db, 'vagas', vaga.id)
        await updateDoc(vagaRef, dadosParaSalvar)
      } else {
        await addDoc(collection(db, 'vagas'), dadosParaSalvar)
      }

      if (onSucesso) onSucesso()
    } catch (err) {
      setError(err.message || 'Erro ao salvar vaga.')
    } finally {
      setLoading(false)
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
    }
  }

  return (
<<<<<<< HEAD
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
          <input type="text" placeholder="Título da Vaga" value={titulo} onChange={e => setTitulo(e.target.value)} className="input" required />
          <input type="text" placeholder="Nome da Empresa" value={empresa} onChange={e => setEmpresa(e.target.value)} className="input" required />
          <input type="text" placeholder="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} className="input" required />
          <input type="text" placeholder="Salário" value={salario} onChange={e => setSalario(e.target.value)} className="input" required />
          <textarea placeholder="Descrição da vaga" value={descricao} onChange={e => setDescricao(e.target.value)} className="input" rows={4} required />
          <input type="email" placeholder="E-mail para contato" value={emailContato} onChange={e => setEmailContato(e.target.value)} className="input" required />
          
          <button type="submit" className="home-button">Publicar Vaga</button>
        </form>
      </div>
    </>
=======
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">
        {vaga ? '✏️ Editar Vaga' : '📢 Publicar Nova Vaga'}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block font-semibold text-orange-700">
          Tipo de Vaga:
          <select
            value={tipoVaga}
            onChange={e => setTipoVaga(e.target.value)}
            className="input-field mt-1 w-full rounded border px-3 py-2"
          >
            <option value="clt">CLT (Fixa)</option>
            <option value="freela">Freela (Diária)</option>
          </select>
        </label>

        <label className="block font-semibold text-orange-700">
          Título:
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            className="input-field mt-1 w-full rounded border px-3 py-2"
            placeholder="Ex: Garçom para restaurante"
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Função:
          <input
            type="text"
            value={funcao}
            onChange={e => setFuncao(e.target.value)}
            required
            className="input-field mt-1 w-full rounded border px-3 py-2"
            placeholder="Ex: Garçom, Cozinheiro..."
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Descrição:
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
            className="input-field mt-1 w-full rounded border px-3 py-2"
            placeholder="Detalhes da vaga, requisitos, etc."
            rows={4}
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Empresa:
          <input
            type="text"
            value={empresa}
            onChange={e => setEmpresa(e.target.value)}
            required
            className="input-field mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        <label className="block font-semibold text-orange-700">
          E-mail para contato:
          <input
            type="email"
            value={emailContato}
            onChange={e => setEmailContato(e.target.value)}
            required
            className="input-field mt-1 w-full rounded border px-3 py-2"
            placeholder="email@empresa.com"
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Cidade:
          <input
            type="text"
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            required
            className="input-field mt-1 w-full rounded border px-3 py-2"
          />
        </label>

        {tipoVaga === 'clt' && (
          <label className="block font-semibold text-orange-700">
            Salário (R$):
            <input
              type="number"
              min="0"
              value={salario}
              onChange={e => setSalario(e.target.value)}
              required={tipoVaga === 'clt'}
              className="input-field mt-1 w-full rounded border px-3 py-2"
              placeholder="Ex: 2500"
            />
          </label>
        )}

        {tipoVaga === 'freela' && (
          <>
            <label className="block font-semibold text-orange-700">
              Valor da Diária (R$):
              <input
                type="number"
                min="0"
                value={valorDiaria}
                onChange={e => setValorDiaria(e.target.value)}
                required={tipoVaga === 'freela'}
                className="input-field mt-1 w-full rounded border px-3 py-2"
                placeholder="Ex: 150"
              />
            </label>

            <fieldset className="border border-gray-300 rounded p-3 mt-4">
              <legend className="font-semibold text-orange-700 mb-2">Datas Agendadas (selecione):</legend>
              <div className="flex flex-wrap gap-3">
                {opcoesDatas.map(data => (
                  <label key={data} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={datasAgendadas.includes(data)}
                      onChange={() => toggleData(data)}
                    />
                    <span>{data}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        <label className="flex items-center space-x-2 mt-4">
          <input
            type="checkbox"
            checked={urgente}
            onChange={() => setUrgente(!urgente)}
          />
          <span className="font-semibold text-orange-700">Vaga Urgente</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-4 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? (vaga ? 'Atualizando...' : 'Publicando...') : vaga ? 'Atualizar Vaga' : 'Publicar Vaga'}
        </button>
      </form>
    </div>
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
  )
}
