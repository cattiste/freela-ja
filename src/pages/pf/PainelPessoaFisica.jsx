import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

import MenuInferiorPF from '@/components/MenuInferiorPF'
import BuscarFreelas from '@/components/BuscarFreelas'
import AvaliacoesRecebidasPF from './AvaliacoesRecebidasPF'
import AgendaEventosPF from './AgendaEventosPF'
import ChamadasPessoaFisica from './ChamadasPessoaFisica'

export default function PainelPessoaFisica() {
  const { usuario } = useAuth()
  const [dados, setDados] = useState(null)

  useEffect(() => {
    if (!usuario?.uid) return
    const carregar = async () => {
      const ref = doc(db, 'usuarios', usuario.uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setDados(snap.data())
      }
    }
    carregar()
  }, [usuario])

  if (!usuario || !dados) {
    return <div className="p-4">Carregando...</div>
  }

  return (
    <div className="pb-24 p-4 space-y-6">
      <div className="bg-white rounded-xl shadow p-4 border border-orange-100">
        <h2 className="text-xl font-bold text-orange-700 mb-2">👤 Meus Dados</h2>
        <p><strong>Nome:</strong> {dados.nome}</p>
        <p><strong>Email:</strong> {dados.email}</p>
        <p><strong>Telefone:</strong> {dados.telefone}</p>
        <p><strong>Endereço:</strong> {dados.endereco}</p>
      </div>

      <AgendaEventosPF />
      <ChamadasPessoaFisica />
      <AvaliacoesRecebidasPF />
      <BuscarFreelas />

      <MenuInferiorPF />
    </div>
  )
}
