import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function PainelVagas() {
  const navigate = useNavigate()
  const [vagas, setVagas] = useState([])

  useEffect(() => {
    const fetchVagas = async () => {
      const querySnapshot = await getDocs(collection(db, 'vagas'))
      const lista = []
      querySnapshot.forEach(doc => {
        lista.push({ id: doc.id, ...doc.data() })
      })
      setVagas(lista)
    }
    fetchVagas()
  }, [])

  return (
    <>
      <div className="w-full max-w-md flex justify-between fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <button onClick={() => navigate(-1)} className="botao-voltar-home">← Voltar</button>
        <button onClick={() => navigate('/')} className="botao-voltar-home botao-home-painel">🏠 Home</button>
      </div>

      <div className="home-container">
        <h1 className="home-title">Vagas Publicadas</h1>
        {vagas.length > 0 ? (
          <div className="resultado-chefs">
            {vagas.map(vaga => (
              <div key={vaga.id} className="perfil-container">
                <h2>{vaga.titulo}</h2>
                <p><strong>Empresa:</strong> {vaga.empresa}</p>
                <p><strong>Cidade:</strong> {vaga.cidade}</p>
                <p><strong>Salário:</strong> {vaga.salario}</p>
                <p><strong>Tipo:</strong> {vaga.tipo}</p>
                <p><strong>Contato:</strong> {vaga.emailContato}</p>
                <p style={{ marginTop: 8 }}>{vaga.descricao}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma vaga publicada ainda.</p>
        )}
      </div>
    </>
  )
}
