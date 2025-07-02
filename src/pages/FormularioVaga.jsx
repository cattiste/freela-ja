import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import DatePicker from 'react-multi-date-picker'

export default function FormularioVaga({ estabelecimento }) {
  const [tipoVaga, setTipoVaga] = useState('clt') // default CLT
  const [titulo, setTitulo] = useState('')
  const [funcao, setFuncao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [empresa, setEmpresa] = useState(estabelecimento?.nome || '')
  const [emailContato, setEmailContato] = useState(estabelecimento?.email || '')
  const [cidade, setCidade] = useState('')
  const [salario, setSalario] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [datasAgendadas, setDatasAgendadas] = useState([]) // array de strings "yyyy-mm-dd"
  const [urgente, setUrgente] = useState(false)
  const [status, setStatus] = useState('ativo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  // Transforma os objetos DatePicker para string no formato yyyy-mm-dd
  const datasFormatadas = datasAgendadas.map(data => {
    if (typeof data === 'string') return data // caso já seja string
    return data.format('YYYY-MM-DD')
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSucesso(null)

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

      if (tipoVaga === 'freela' && datasFormatadas.length === 0) {
        throw new Error('Selecione pelo menos uma data para vaga Freela.')
      }

      // Converte datas para timestamps do Firestore
      const datasTimestamp = datasFormatadas.map(d => new Date(d))

      await addDoc(collection(db, 'vagas'), {
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
        status,
        dataPublicacao: serverTimestamp(),
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome,
      })

      setSucesso('Vaga publicada com sucesso!')
      // resetar campos (opcional)
      setTitulo('')
      setFuncao('')
      setDescricao('')
      setSalario('')
      setValorDiaria('')
      setDatasAgendadas([])
      setUrgente(false)
    } catch (err) {
      setError(err.message || 'Erro ao publicar vaga.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">Publicar Vaga</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}
      {sucesso && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{sucesso}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block font-semibold text-orange-700">
          Tipo de Vaga:
          <select
            value={tipoVaga}
            onChange={e => setTipoVaga(e.target.value)}
            className="input-field mt-1"
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
            className="input-field mt-1"
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
            className="input-field mt-1"
            placeholder="Ex: Garçom, Cozinheiro..."
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Descrição:
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
            className="input-field mt-1"
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
            className="input-field mt-1"
          />
        </label>

        <label className="block font-semibold text-orange-700">
          E-mail para contato:
          <input
            type="email"
            value={emailContato}
            onChange={e => setEmailContato(e.target.value)}
            required
            className="input-field mt-1"
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
            className="input-field mt-1"
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
              className="input-field mt-1"
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
                className="input-field mt-1"
                placeholder="Ex: 150"
              />
            </label>

            <div className="mt-4">
              <label className="block font-semibold text-orange-700 mb-2">Datas Agendadas (selecione):</label>
              <DatePicker
                multiple
                value={datasAgendadas}
                onChange={setDatasAgendadas}
                format="YYYY-MM-DD"
                className="w-full"
                sort
              />
            </div>
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
          className="btn-primary w-full mt-4"
        >
          {loading ? 'Publicando...' : 'Publicar Vaga'}
        </button>
      </form>
    </div>
  )
}
