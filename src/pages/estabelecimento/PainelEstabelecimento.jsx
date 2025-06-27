import React, { useEffect, useState } from 'react'
import AvaliacaoFreela from './AvaliacaoFreela'
import { auth, db } from '../../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function PainelEstabelecimento() {
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Observa mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Pega dados do estabelecimento no Firestore pelo uid do usuário logado
          const docRef = doc(db, 'usuarios', user.uid)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const data = docSnap.data()
            if (data.tipo === 'estabelecimento') {
              setEstabelecimento({ uid: user.uid, ...data })
            } else {
              alert('Você não tem permissão para acessar este painel.')
              setEstabelecimento(null)
            }
          } else {
            alert('Dados do estabelecimento não encontrados.')
            setEstabelecimento(null)
          }
        } catch (error) {
          console.error('Erro ao buscar dados do estabelecimento:', error)
          alert('Erro ao carregar dados.')
          setEstabelecimento(null)
        }
      } else {
        // Usuário não está logado
        setEstabelecimento(null)
      }
      setLoading(false)
    })

    // Cleanup
    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center text-orange-600">
        Carregando painel do estabelecimento...
      </div>
    )
  }

  if (!estabelecimento) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-red-600">
        <p>Você precisa estar logado como estabelecimento para acessar este painel.</p>
        {/* Aqui você pode colocar link para login ou redirecionar automaticamente */}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-orange-700 mb-6 text-center">
        Painel do Estabelecimento: {estabelecimento.nome}
      </h1>

      {/* Aqui você pode colocar outros componentes do painel, por exemplo: */}
      <AvaliacaoFreela estabelecimento={estabelecimento} />

      {/* Pode adicionar aqui o componente BuscarFreelas, etc. */}
    </div>
  )
}
