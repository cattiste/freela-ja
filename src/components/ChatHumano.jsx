// src/components/ChatHumano.jsx
import React, { useState } from 'react'
import { db } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function ChatHumano() {
  const { usuario } = useAuth()
  const [mensagem, setMensagem] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  const handleEnviar = async () => {
    if (!mensagem) return toast.error('Digite uma mensagem')

    try {
      await addDoc(collection(db, 'suporte_mensagens'), {
        mensagem,
        nome: usuario?.nome || nome || 'Anônimo',
        email: usuario?.email || email || 'Não informado',
        remetenteUid: usuario?.uid || null,
        tipo: 'usuario',
        criadoEm: serverTimestamp(),
      })
      setEnviado(true)
      setMensagem('')
      toast.success('Mensagem enviada com sucesso!')
    } catch (error) {
      toast.error('Erro ao enviar mensagem')
      console.error(error)
    }
  }

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-2">💬 Falar com Suporte Humano</h2>

      {!usuario && (
        <>
          <input
            type="text"
            className="w-full mb-2 p-2 border rounded"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="email"
            className="w-full mb-2 p-2 border rounded"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </>
      )}

      <textarea
        className="w-full mb-2 p-2 border rounded"
        placeholder="Digite sua mensagem..."
        rows={4}
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
      />

      <button
        onClick={handleEnviar}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={enviado}
      >
        Enviar mensagem
      </button>

      {enviado && (
        <p className="mt-2 text-green-600 text-sm">
          Sua mensagem foi enviada. Em breve entraremos em contato!
        </p>
      )}
    </div>
  )
}
