import React from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function RespostasRapidasFreela({ chamadaId }) {
  const { usuario } = useAuth()

  const mensagens = [
    'Estou a caminho 🚗',
    'Cheguei ao local 📍',
    'Estou na porta 🚪',
    'Finalizei o serviço ✅',
  ]

  const enviarMensagem = async (texto) => {
    if (!usuario?.uid || !chamadaId) return

    try {
      await addDoc(collection(db, 'chamadas', chamadaId, 'mensagens'), {
        remetenteUid: usuario.uid,
        mensagem: texto,
        criadoEm: serverTimestamp()
      })
      toast.success('Mensagem enviada!')
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
      toast.error('Erro ao enviar mensagem.')
    }
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-medium text-gray-700 mb-2">💬 Respostas rápidas:</p>
      <div className="flex flex-wrap gap-2">
        {mensagens.map((msg, idx) => (
          <button
            key={idx}
            onClick={() => enviarMensagem(msg)}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition"
          >
            {msg}
          </button>
        ))}
      </div>
    </div>
  )
}
