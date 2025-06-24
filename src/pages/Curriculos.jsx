import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Curriculos.css'

export default function Curriculos() {
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
      <div className="nav-buttons">
        <button
          onClick={() => navigate(-1)}
          className="botao-voltar-home"
          aria-label="Voltar"
        >
          ← Voltar
        </button>
        <button
          onClick={() => navigate('/')}
          className="botao-voltar-home botao-home-painel"
          aria-label="Home"
        >
          🏠 Home
        </button>
      </div>

      <div className="curriculos-container">
        <h2 className="curriculos-title">Painel de Vagas CLT</h2>
        <p className="curriculos-subtitle">Confira vagas fixas publicadas por estabelecimentos</p>

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
