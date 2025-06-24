// src/pages/PainelFreela.jsx
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

  useEffect(() => {
    // Checar usuário logado no localStorage
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuarioLogado || usuarioLogado.tipo !== 'freela') {
      navigate('/login')
      return
    }

    // Buscar dados atualizados do freela no Firestore pelo email
    const fetchFreela = async () => {
      setLoading(true)
      try {
        const q = query(collection(db, 'usuarios'), where('email', '==', usuarioLogado.email))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
          const dados = querySnapshot.docs[0].data()
          setFreela(dados)
        } else {
          alert('Usuário não encontrado no banco')
          navigate('/login')
        }
      } catch (err) {
        alert('Erro ao buscar dados: ' + err.message)
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    fetchFreela()
  }, [navigate])

  if (loading) return <p>Carregando dados...</p>

  return (
    <div className="home-container">
      <h1 className="home-title">Painel Freelancer</h1>
      {freela && (
        <div className="perfil-container">
          <img
            src={freela.foto || avatarFallback}
            alt="Foto do Freela"
            className="perfil-foto"
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
