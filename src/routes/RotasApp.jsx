import React from 'react'
import { Routes } from 'react-router-dom'
import RotasPublicas from './RotasPublicas'
import { RotasFreela } from './RotasFreela'
import { RotasEstabelecimento } from './RotasEstabelecimento'

console.log('Renderizando RotasApp com usuario:', usuario)

export default function RotasApp({ usuario }) {
  return (
    <Routes>
      <RotasPublicas />
      <RotasFreela usuario={usuario} />
      <RotasEstabelecimento usuario={usuario} />
    </Routes>
  )
}
