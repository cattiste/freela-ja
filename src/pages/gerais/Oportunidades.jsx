import { Helmet } from 'react-helmet'
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'

export default function Oportunidades() {
  const [vagas, setVagas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState('')
  const [valorMinimo, setValorMinimo] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarVagas() {
      try {
        const q = query(collection(db, 'vagas'), where('status', '==', 'ativo'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      } catch (err) {
        console.error('Erro ao buscar vagas:', err)
      }
    }

    carregarVagas()
  }, [])

  const filtrarVagas = (vaga) => {
    return (
      (!filtro || vaga.titulo?.toLowerCase().includes(filtro.toLowerCase()) || vaga.descricao?.toLowerCase().includes(filtro.toLowerCase())) &&
      (!cidade || vaga.cidade?.toLowerCase().includes(cidade.toLowerCase())) &&
      (!tipo || vaga.tipo?.toLowerCase().includes(tipo.toLowerCase())) &&
      (!valorMinimo || parseFloat(vaga.valorDiaria || 0) >= parseFloat(valorMinimo))
    )
  }

  return (
    <>
      <Helmet>
        <title>Oportunidades | Freela Já</title>
        <meta name="description" content="Veja as vagas mais recentes e oportunidades de trabalho como freelancer perto de você." />
      </Helmet>

      <div
        className="min-h-screen bg-cover bg-center p-6"
        style={{
          backgroundImage: `url('/img/bg-restaurante-hero.jpg')`,
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-7xl mx-auto shadow-xl">
        <div className="max-w-7x2 mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-blue-800">🚀 Oportunidades em Alta</h1>

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Input placeholder="🔍 Buscar vaga ou descrição..." value={filtro} onChange={e => setFiltro(e.target.value)} />
            <Input placeholder="📍 Cidade" value={cidade} onChange={e => setCidade(e.target.value)} />
            <Input placeholder="📅 Tipo (ex: Garçom)" value={tipo} onChange={e => setTipo(e.target.value)} />
            <Input placeholder="💰 Mínimo R$" value={valorMinimo} onChange={e => setValorMinimo(e.target.value)} type="number" />
          </div>

          {vagas.filter(filtrarVagas).length === 0 ? (
            <p className="text-gray-600">🔍 Nenhuma vaga com os filtros atuais.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vagas.filter(filtrarVagas).map(vaga => (
                <div
                  key={vaga.id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-xl cursor-pointer transition border-l-4 border-blue-500"
                  onClick={() => navigate(`/vaga/${vaga.id}`)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-blue-700">{vaga.titulo}</h2>
                    {vaga.urgente && <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">🔥 Urgente</span>}
                  </div>
                  <p className="text-gray-700">🏢 {vaga.empresa}</p>
                  <p className="text-gray-700">📍 {vaga.cidade}</p>
                  <p className="text-gray-700">💰 {vaga.valorDiaria ? `R$ ${vaga.valorDiaria}` : vaga.salario}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{vaga.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
