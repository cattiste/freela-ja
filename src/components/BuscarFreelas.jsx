import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

export default function BuscarFreelas({ estabelecimento }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarFreelas() {
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'))
        const lista = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.tipo === 'freela') {
            lista.push({ id: doc.id, ...data })
          }
        })
        setFreelas(lista)
      } catch (err) {
        console.error('Erro ao buscar freelancers:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarFreelas()
  }, [])

  if (carregando) return <p>Carregando freelancers...</p>
  if (freelas.length === 0) return <p>Nenhum freelancer encontrado.</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {freelas.map(f => (
        <div key={f.id} className="p-4 bg-white rounded shadow">
          <p><strong>Nome:</strong> {f.nome}</p>
          <p><strong>Função:</strong> {f.funcao}</p>
          <p><strong>Celular:</strong> {f.celular}</p>
          {/* Você pode adicionar botão de chamar aqui */}
        </div>
      ))}
    </div>
  )
}
