// src/pages/freela/PainelFreela.jsx

import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { Mail, Phone, Briefcase, MapPin, UserCircle2 } from 'lucide-react'

export default function PainelFreela() {
  const [freela, setFreela] = useState(null)
  const [abaAtiva, setAbaAtiva] = useState('perfil')

  const freelaId = 'SJxo1kLxihcJnoMB0lOJpKH648x2' // <- depois torna isso dinâmico com auth

  useEffect(() => {
    const buscarFreela = async () => {
      try {
        const ref = doc(db, 'usuarios', freelaId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setFreela(snap.data())
        }
      } catch (err) {
        console.error('Erro ao buscar freela:', err)
      }
    }

    buscarFreela()
  }, [])

  const renderPerfil = () => {
    if (!freela) return <p className="text-center">Carregando perfil...</p>

    return (
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center max-w-md mx-auto mt-4 border">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange-500 shadow mb-4">
          {freela.foto ? (
            <img src={freela.foto} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <UserCircle2 className="w-full h-full text-gray-300" />
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center">{freela.nome}</h2>

        <div className="mt-3 space-y-1 text-sm text-gray-600 w-full">
          <div className="flex items-center gap-2">
            <Briefcase size={16} />
            <span>{freela.funcao}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{freela.endereco}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <span>{freela.celular}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>{freela.email}</span>
          </div>
        </div>

        <div className="mt-4 text-green-700 font-semibold">
          💰 Diária: R$ {freela.valorDiaria?.toFixed(2)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {abaAtiva === 'perfil' && renderPerfil()}

      {/* Navbar inferior fixa */}
      <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-3 shadow-inner">
        <button onClick={() => setAbaAtiva('perfil')} className={abaAtiva === 'perfil' ? 'text-orange-600 font-bold' : 'text-gray-500'}>
          👤 Perfil
        </button>
        <button onClick={() => setAbaAtiva('agenda')} className={abaAtiva === 'agenda' ? 'text-orange-600 font-bold' : 'text-gray-500'}>
          📅 Agenda
        </button>
        <button onClick={() => setAbaAtiva('avaliacoes')} className={abaAtiva === 'avaliacoes' ? 'text-orange-600 font-bold' : 'text-gray-500'}>
          ⭐ Avaliações
        </button>
      </nav>
    </div>
  )
}
