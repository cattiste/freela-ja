import React from 'react'
import { Routes } from 'react-router-dom'
import RotasPublicas from './RotasPublicas'
import { RotasFreela } from './RotasFreela'
import { RotasEstabelecimento } from './RotasEstabelecimento'

export default function RotasApp({ usuario }) {
  console.log('Renderizando RotasApp com usuario:', usuario)

  return (
    <Routes>
      <RotasPublicas usuario={usuario} />
      <RotasFreela usuario={usuario} />
      <RotasEstabelecimento usuario={usuario} />
    </Routes>
  )
}
