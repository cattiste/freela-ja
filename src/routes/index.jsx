import React from 'react'
import { Routes } from 'react-router-dom'
import { RotasPublicas } from '@/RotasPublicas'
import RotaProtegidaFreela from '@/components/protegidas/RotaProtegidaFreela.jsx'
import RotaProtegidaEstabelecimento from '@/components/protegidas/RotaProtegidaEstabelecimento.jsx'


export default function RotasApp({ usuario }) {
  return (
    <Routes>
      <RotasPublicas />
      <RotasFreela usuario={usuario} />
      <RotasEstabelecimento usuario={usuario} />
    </Routes>
  )
}
