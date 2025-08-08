
// src/components/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from './ProfissionalCard'
import { haversineDistance } from '@/utils/haversine'

export default function BuscarFreelas({ usuario, usuariosOnline }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const buscar = async () => {
      if (!usuario?.localizacao) return

      setCarregando(true)

      let q = query(
        collection(db, 'usuarios'),
        where('tipo', '==', 'freela')
      )

      const snap = await getDocs(q)
      let lista = []

      snap.forEach(doc => {
        const dados = doc.data()
        const id = doc.id

        // Remove o próprio usuário
        if (id === usuario.uid) return

        // 🔍 Filtra por função somente se for um estabelecimento
        if (usuario.tipo === 'estabelecimento' && dados.funcao !== usuario.funcaoDesejada) {
          return
        }

        // Distância em km
        let distancia = 0
        if (dados.localizacao && usuario.localizacao) {
          distancia = haversineDistance(
            usuario.localizacao,
            dados.localizacao
          )
        }

        const online = usuariosOnline?.[id]?.online === true

        lista.push({
          id,
          ...dados,
          distancia,
          online,
        })
      })

      // Ordena: online primeiro, depois por distância
      lista.sort((a, b) => {
        if (a.online && !b.online) return -1
        if (!a.online && b.online) return 1
        return a.distancia - b.distancia
      })

      setFreelas(lista)
      setCarregando(false)
    }

    buscar()
  }, [usuario, usuariosOnline])

  if (carregando) return <p className="p-4">Carregando freelancers...</p>

  return (
    <div className="p-4 space-y-4">
      {freelas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum freelancer disponível.</p>
      ) : (
        freelas.map(f => (
          <ProfissionalCard key={f.id} freela={f} estabelecimento={usuario} />
        ))
      )}
    </div>
  )
}
