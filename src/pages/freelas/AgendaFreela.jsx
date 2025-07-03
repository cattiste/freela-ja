import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase'

function formatarData(timestamp) {
  if (!timestamp) return 'Não informado'
  if (timestamp.seconds) {
    const data = new Date(timestamp.seconds * 1000)
    return data.toLocaleDateString('pt-BR')
  }
  return new Date(timestamp).toLocaleDateString('pt-BR')
}

export default function AgendaFreela({ freela }) {
  const [vagas, setVagas] = useState([])
  const [eventos, setEventos] = useState([])
  const [candidaturasVagas, setCandidaturasVagas] = useState([])
  const [candidaturasEventos, setCandidaturasEventos] = useState([])
  const [loadingVagas, setLoadingVagas] = useState(true)
  const [loadingEventos, setLoadingEventos] = useState(true)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  // Carrega vagas abertas
  useEffect(() => {
    const carregarVagas = async () => {
      setLoadingVagas(true)
      setErro(null)
      try {
        const q = query(collection(db, 'vagas'), where('status', '==', 'aberta'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      } catch (err) {
        console.error('Erro ao carregar vagas:', err)
        setErro('Erro ao carregar vagas. Tente novamente.')
      }
      setLoadingVagas(false)
    }
    carregarVagas()
  }, [])

  // Carrega eventos ativos
  useEffect(() => {
    const carregarEventos = async () => {
      setLoadingEventos(true)
      try {
        const q = query(collection(db, 'eventos'), where('ativo', '==', true))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setEventos(lista)
      } catch (err) {
        console.error('Erro ao carregar eventos:', err)
        setErro('Erro ao carregar eventos. Tente novamente.')
      }
      setLoadingEventos(false)
    }
    carregarEventos()
  }, [])

  // Carrega candidaturas do freela (vagas e eventos)
  useEffect(() => {
    if (!freela?.uid) return

    const carregarCandidaturas = async () => {
      try {
        const q = query(
          collection(db, 'candidaturas'),
          where('freelaUid', '==', freela.uid)
        )
        const snapshot = await getDocs(q)
        const idsVagas = snapshot.docs.map(doc => doc.data().vagaId)
        setCandidaturasVagas(idsVagas)
      } catch (err) {
        console.error('Erro ao carregar candidaturas vagas:', err)
      }

      try {
        const q2 = query(
          collection(db, 'candidaturasEventos'),
          where('freelaUid', '==', freela.uid)
        )
        const snapshot2 = await getDocs(q2)
        const idsEventos = snapshot2.docs.map(doc => doc.data().eventoId)
        setCandidaturasEventos(idsEventos)
      } catch (err) {
        console.error('Erro ao carregar candidaturas eventos:', err)
      }
    }
    carregarCandidaturas()
  }, [freela])

  async function candidatarVaga(vaga) {
    if (!freela?.uid) {
      setErro('Você precisa estar logado para se candidatar.')
      return
    }
    setErro(null)
    setSucesso(null)
    try {
      await addDoc(collection(db, 'candidaturas'), {
        vagaId: vaga.id,
        estabelecimentoUid: vaga.estabelecimentoUid || null,
        freelaUid: freela.uid,
        dataCandidatura: serverTimestamp(),
        status: 'pendente',
      })
      setCandidaturasVagas(prev => [...prev, vaga.id])
      setSucesso(`Candidatura enviada para vaga: ${vaga.titulo || vaga.funcao || ''}`)
    } catch (err) {
      console.error('Erro ao candidatar:', err)
      setErro('Erro ao enviar candidatura. Tente novamente.')
    }
  }

  async function candidatarEvento(evento) {
    if (!freela?.uid) {
      setErro('Você precisa estar logado para se candidatar.')
      return
    }
    setErro(null)
    setSucesso(null)
    try {
      await addDoc(collection(db, 'candidaturasEventos'), {
        eventoId: evento.id,
        freelaUid: freela.uid,
        dataCandidatura: Timestamp.now(),
        status: 'pendente',
      })
      setCandidaturasEventos(prev => [...prev, evento.id])
      setSucesso(`Candidatura enviada para evento: ${evento.nome || ''}`)
    } catch (err) {
      console.error('Erro ao candidatar-se:', err)
      setErro('Erro ao enviar candidatura para evento. Tente novamente.')
    }
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-orange-700 mb-6 text-center">📆 Oportunidades</h1>

      {(erro || sucesso) && (
        <div
          className={`mb-6 p-3 rounded ${
            erro ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          {erro || sucesso}
          <button
            onClick={() => {
              setErro(null)
              setSucesso(null)
            }}
            className="float-right font-bold hover:underline"
            aria-label="Fechar mensagem"
          >
            ✕
          </button>
        </div>
      )}

      {/* Vagas */}
      <section>
        <h2 className="text-2xl font-semibold text-orange-700 mb-4">🎯 Vagas Disponíveis</h2>
        {loadingVagas ? (
          <p className="text-orange-600">Carregando vagas...</p>
        ) : vagas.length === 0 ? (
          <p className="text-gray-600">Nenhuma vaga disponível no momento.</p>
        ) : (
          <div className="space-y-6">
            {vagas.map(vaga => (
              <div
                key={vaga.id}
                className={`p-5 border rounded-xl shadow ${
                  vaga.urgente ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              >
                <h3 className="text-xl font-semibold text-orange-700 mb-2">
                  {vaga.titulo || vaga.funcao || 'Sem título'}
                </h3>

                <p>
                  <strong>Tipo:</strong>{' '}
                  {vaga.tipoVaga?.toLowerCase() === 'clt' ? 'CLT (Fixa)' : 'Freela (Diária)'}
                </p>

                {vaga.tipoVaga?.toLowerCase() === 'freela' && vaga.valorDiaria != null && (
                  <p>
                    <strong>Valor da diária:</strong> R$ {Number(vaga.valorDiaria).toFixed(2).replace('.', ',')}
                  </p>
                )}

                {vaga.tipoVaga?.toLowerCase() === 'clt' && vaga.salario != null && (
                  <p>
                    <strong>Salário:</strong> R$ {Number(vaga.salario).toFixed(2).replace('.', ',')}
                  </p>
                )}

                <p>
                  <strong>Data da publicação:</strong> {formatarData(vaga.dataPublicacao)}
                </p>

                {vaga.descricao && (
                  <p className="mt-2 text-gray-700">
                    <strong>Descrição:</strong> {vaga.descricao}
                  </p>
                )}

                {vaga.urgente && (
                  <p className="text-red-600 font-semibold mt-3 uppercase tracking-wide">URGENTE</p>
                )}

                <button
                  onClick={() => candidatarVaga(vaga)}
                  disabled={candidaturasVagas.includes(vaga.id)}
                  className={`mt-4 px-4 py-2 rounded font-semibold text-white transition ${
                    candidaturasVagas.includes(vaga.id)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {candidaturasVagas.includes(vaga.id) ? 'Já Candidatado' : 'Candidatar-se'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Eventos */}
      <section>
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">🎉 Eventos Disponíveis</h2>
        {loadingEventos ? (
          <p className="text-blue-600">Carregando eventos...</p>
        ) : eventos.length === 0 ? (
          <p className="text-gray-600">Nenhum evento disponível no momento.</p>
        ) : (
          eventos.map(evento => (
            <div
              key={evento.id}
              className="border border-gray-300 p-4 rounded-xl bg-white mb-4 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-800">{evento.nome}</h3>
              <p className="text-gray-600 text-sm mt-1">{evento.descricao}</p>
              <p className="text-sm mt-2 text-gray-500">
                📍 <strong>Local:</strong> {evento.local}
                <br />
                📅 <strong>Data:</strong>{' '}
                {evento.data?.toDate ? evento.data.toDate().toLocaleDateString('pt-BR') : 'Data não definida'}
              </p>
              <button
                onClick={() => candidatarEvento(evento)}
                disabled={candidaturasEventos.includes(evento.id)}
                className={`mt-3 px-4 py-1.5 rounded font-semibold text-white transition ${
                  candidaturasEventos.includes(evento.id)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {candidaturasEventos.includes(evento.id) ? 'Já Candidatado' : '📩 Candidatar-se'}
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
