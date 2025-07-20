import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'
import Chamadas from '@/components/ChamadaInline'
import Eventos from '@/pages/freela/EventosDisponiveis'
import Vagas from '@/pages/freela/VagasDisponiveis'
import ConfiguracoesFreela from '@/pages/freela/ConfiguracoesFreela'
import HistoricoFreela from '@/pages/freela/HistoricoTrabalhosFreela'

export default function PerfilFreela({ freelaId }) {
  const [freela, setFreela] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarFreela() {
      try {
        const docRef = doc(db, 'usuarios', freelaId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setFreela(docSnap.data())
        } else {
          console.warn('Freela não encontrado no Firestore.')
        }
      } catch (erro) {
        console.error('Erro ao buscar dados do freela:', erro)
      } finally {
        setCarregando(false)
      }
    }

    if (freelaId) {
      carregarFreela()
    }
  }, [freelaId])

  if (carregando) return <div className="mt-4 text-center">Carregando dados do perfil...</div>
  if (!freela) return <div className="mt-4 text-center text-red-500">Erro ao carregar o perfil.</div>

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md text-center">
      <img
        src={freela.foto || '/placeholder.png'}
        alt="Foto do Freela"
        className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-500"
      />
      <h2 className="text-xl font-bold mt-2">{freela.nome}</h2>
      <p className="text-sm text-gray-600">{freela.funcao}</p>
      <p className="text-sm text-gray-600">{freela.especialidades}</p>
      <p className="text-sm text-gray-600">{freela.endereco}</p>
      <p className="text-sm text-gray-600">{freela.celular}</p>
      <p className="text-sm text-gray-600">
        Valor diária: R$ {freela.valorDiaria ? freela.valorDiaria.toFixed(2) : 'não informado'}
      </p>
    </div>
  )
}