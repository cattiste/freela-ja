import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../../firebase'

import AvaliacaoFreela from './AvaliacaoFreela'
import BuscarFreelas from './BuscarFreelas'

export default function PainelEstabelecimento() {
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [telaAtiva, setTelaAtiva] = useState('buscar') // buscar ou avaliar

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, 'usuarios'),
            where('uid', '==', user.uid),
            where('tipo', '==', 'estabelecimento')
          )
          const querySnapshot = await getDocs(q)

          if (querySnapshot.empty) {
            setEstabelecimento(null)
            setCarregando(false)
            return
          }

          const docEstab = querySnapshot.docs[0].data()
          setEstabelecimento(docEstab)
          setCarregando(false)
        } catch (error) {
          console.error('Erro ao buscar dados do estabelecimento:', error)
          setEstabelecimento(null)
          setCarregando(false)
        }
      } else {
        setEstabelecimento(null)
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (carregando) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando dados do estabelecimento...
      </div>
    )
  }

  if (!estabelecimento) {
    return (
      <p className="text-center text-red-600 font-semibold mt-10">
        Dados do estabelecimento não encontrados. Por favor, verifique se você está logado com uma conta de estabelecimento.
      </p>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-orange-700 text-center">
        Painel do Estabelecimento
      </h1>

      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`btn-primary ${telaAtiva === 'buscar' ? 'opacity-100' : 'opacity-60'}`}
          onClick={() => setTelaAtiva('buscar')}
        >
          Buscar Freelancers
        </button>
        <button
          className={`btn-primary ${telaAtiva === 'avaliar' ? 'opacity-100' : 'opacity-60'}`}
          onClick={() => setTelaAtiva('avaliar')}
        >
          Avaliar Freelancers
        </button>
      </div>

      {telaAtiva === 'buscar' && <BuscarFreelas estabelecimento={estabelecimento} />}
      {telaAtiva === 'avaliar' && <AvaliacaoFreela estabelecimento={estabelecimento} />}
    </div>
  )
}
