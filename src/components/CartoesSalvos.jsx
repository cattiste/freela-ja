import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function CartoesSalvos() {
  const { usuario } = useAuth()
  const [cartoes, setCartoes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario?.uid) return

    const fetchCartoes = async () => {
      setCarregando(true)
      try {
        const ref = collection(db, 'usuarios', usuario.uid, 'cartoes')
        const snapshot = await getDocs(ref)
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        setCartoes(lista)
      } catch (error) {
        console.error('Erro ao buscar cartões:', error)
      } finally {
        setCarregando(false)
      }
    }

    fetchCartoes()
  }, [usuario])

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Cartões Salvos</h2>

      {carregando && <p>Carregando...</p>}

      {!carregando && cartoes.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum cartão salvo.</p>
      )}

      <ul className="space-y-2">
        {cartoes.map((cartao) => (
          <li key={cartao.id} className="border p-3 rounded-md bg-gray-50">
            <span className="font-medium">•••• {cartao.ultimos4}</span>
            <p className="text-xs text-gray-500">Token: {cartao.payment_token}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
