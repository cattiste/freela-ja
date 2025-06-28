// src/pages/PainelVagas.jsx
import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useNavigate } from 'react-router-dom'

export default function PainelVagas() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])

  useEffect(() => {
    const fetchVagas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'vagas'))
        const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
      }
    }

    fetchVagas()
  }, [])

  return (
    <>
      {/* Botões de navegação fixos no topo */}
      <div className="w-full max-w-md flex justify-between fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <button onClick={() => navigate(-1)} className="botao-voltar-home">← Voltar</button>
        <button onClick={() => navigate('/')} className="botao-voltar-home botao-home-painel">🏠 Home</button>
      </div>

      {/* Conteúdo principal */}
      <div className="home-container mt-24">
        <h1 className="home-title">📌 Vagas Publicadas</h1>

        {vagas.length > 0 ? (
          <div className="resultado-chefs">
            {vagas.map(vaga => (
              <div key={vaga.id} className="perfil-container">
                <h2 className="text-xl font-bold text-blue-700">{vaga.titulo}</h2>
                <p><strong>🏢 Empresa:</strong> {vaga.empresa}</p>
                <p><strong>📍 Cidade:</strong> {vaga.cidade}</p>
                <p><strong>💰 Salário:</strong> {vaga.salario}</p>
                <p><strong>📄 Tipo:</strong> {vaga.tipo}</p>
                <p><strong>✉️ Contato:</strong> {vaga.emailContato}</p>
                <p className="mt-2 text-gray-700">{vaga.descricao}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600 mt-8">🔎 Nenhuma vaga publicada ainda.</p>
        )}
      </div>
    </>
  )
}
