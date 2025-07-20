// src/pages/freela/PerfilFreela.jsx

import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { Mail, Phone, Briefcase, MapPin, UserCircle2, Wallet } from 'lucide-react'

export default function PerfilFreela({ freelaId }) {
  const [freela, setFreela] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFreela = async () => {
      try {
        const ref = doc(db, 'usuarios', freelaId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setFreela(snap.data())
        }
      } catch (err) {
        console.error('Erro ao buscar dados do freela:', err)
      } finally {
        setLoading(false)
      }
    }

    if (freelaId) fetchFreela()
  }, [freelaId])

  if (loading) return <p className="text-center">Carregando perfil...</p>
  if (!freela) return <p className="text-center text-red-600">Freela não encontrado.</p>

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-md mx-auto border">
      <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange-500 shadow mb-4">
        {freela.foto ? (
          <img
            src={freela.foto}
            alt="Foto do Freela"
            className="w-full h-full object-cover"
          />
        ) : (
          <UserCircle2 className="w-full h-full text-gray-300" />
        )}
      </div>

      <h2 className="text-xl font-bold text-gray-800 text-center">{freela.nome}</h2>

      <div className="mt-3 space-y-2 text-sm text-gray-700 w-full">
        <div className="flex items-center gap-2">
          <Briefcase size={18} />
          <span>{freela.funcao}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={18} />
          <span>{freela.endereco}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={18} />
          <span>{freela.celular}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={18} />
          <span>{freela.email}</span>
        </div>
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <Wallet size={18} />
          <span>Diária: R$ {parseFloat(freela.valorDiaria || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
