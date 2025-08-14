import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PerfilContratante() {
  const { uid } = useParams()
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!uid) return
      try {
        const ref = doc(db, 'usuarios', uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setDados(snap.data())
        } else {
          console.warn('Usuário não encontrado')
        }
      } catch (e) {
        console.error('Erro ao carregar perfil do contratante:', e)
      } finally {
        setCarregando(false)
      }
    }
    fetch()
  }, [uid])

  if (carregando) {
    return <div className="p-6 text-center text-orange-600">Carregando perfil...</div>
  }

  if (!dados) {
    return <div className="p-6 text-center text-gray-500">Perfil não encontrado.</div>
  }

  return (
    <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-xl space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={dados.foto || 'https://via.placeholder.com/100'}
            alt={dados.nome}
            className="w-24 h-24 rounded-full object-cover border"
          />
          <div>
            <h1 className="text-2xl font-bold text-orange-700">{dados.nome}</h1>
            <p className="text-gray-600">Pessoa Física</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">E-mail</label>
            <p className="text-gray-800">{dados.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Celular</label>
            <p className="text-gray-800">{dados.celular || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">Endereço</label>
            <p className="text-gray-800">{dados.endereco || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
