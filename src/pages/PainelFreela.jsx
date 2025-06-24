import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Home.css'

const avatarFallback = 'https://i.imgur.com/3W8i1sT.png'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuarioLogado || usuarioLogado.tipo !== 'freela') {
      navigate('/login')
      return
    }

    const fetchFreela = async () => {
      setLoading(true)
      setError(null)
      try {
        const q = query(collection(db, 'usuarios'), where('email', '==', usuarioLogado.email))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const dados = querySnapshot.docs[0].data()
          setFreela(dados)
        } else {
          setError('Usuário não encontrado no banco de dados.')
          navigate('/login')
        }
      } catch (err) {
        setError('Erro ao buscar dados: ' + err.message)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchFreela()
  }, [navigate])

  if (loading) return <p>Carregando dados...</p>
  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div className="home-container">
      <h1 className="home-title">Painel Freelancer</h1>
      {freela && (
        <div className="perfil-container">
          <img
            src={freela.foto || avatarFallback}
            alt="Foto do Freela"
            className="perfil-foto"
            onError={(e) => (e.target.src = avatarFallback)}
          />
          <h2>{freela.nome}</h2>
          <p><strong>Função:</strong> {freela.funcao}</p>
          <p><strong>Email:</strong> {freela.email}</p>
          <p><strong>Celular:</strong> {freela.celular}</p>
          <p><strong>Endereço:</strong> {freela.endereco}</p>
        </div>
      )}
    </div>
  )
}
