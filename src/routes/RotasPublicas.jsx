import React from 'react'
import { Routes } from 'react-router-dom'
import RotasPublicas from './RotasPublicas'
import { RotasFreela } from './RotasFreela'
import { RotasEstabelecimento } from './RotasEstabelecimento'

export default function RotasApp({ usuario }) {
  return (
    <Routes>
      {/* Aqui chamamos as funções e espalhamos os <Route /> delas */}
      {RotasPublicas()}
      {RotasFreela(usuario)}
      {RotasEstabelecimento(usuario)}
    </Routes>
  )
}
