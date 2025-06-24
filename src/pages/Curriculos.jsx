// src/pages/Contratar.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Contratar.css'

export default function Contratar() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVagas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'vagas'))
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      } catch (error) {
        console.error('Erro ao buscar vagas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVagas()
  }, [])

  return (
    <>
      <div className="w-full max-w-md flex justify-between fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => navigate(-1)}
          className="botao-voltar-home"
          aria-label="Voltar"
          style={{ left: '20px', right: 'auto', position: 'fixed' }}
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="botao-voltar-home botao-home-painel"
          aria-label="Home"
          style={{ right: '20px', left: 'auto', position: 'fixed' }}
        >
          🏠 Home
        </button>
      </div>

      <div className="contratar-container">
        <h2 className="contratar-title">Painel de Vagas CLT</h2>
        <p className="contratar-subtitle">Confira vagas fixas publicadas por estabelecimentos</p>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Carregando vagas...</p>
        ) : vagas.length > 0 ? (
          <div className="resultado-chefs">
            {vagas.map(vaga => (
              <div key={vaga.id} className="card-profissional">
                <h3>{vaga.titulo}</h3>
                <p><strong>Empresa:</strong> {vaga.empresa}</p>
                <p><strong>Cidade:</strong> {vaga.cidade}</p>
                <p><strong>Tipo:</strong> {vaga.tipo}</p>
                <p><strong>Salário:</strong> {vaga.salario}</p>
                <p className="descricao">{vaga.descricao}</p>
                <a
                  href={`mailto:${vaga.emailContato}?subject=Candidatura para vaga: ${vaga.titulo}`}
                  className="card-botao"
                >
                  Candidatar-se
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>Nenhuma vaga disponível no momento.</p>
        )}
      </div>
    </>
  )
}
