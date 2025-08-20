// src/pages/gerais/Suporte.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function Suporte() {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [mensagens, setMensagens] = useState([])
  const [emailSalvo, setEmailSalvo] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem('suporte_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setEmailSalvo(true)
    }
  }, [])

  useEffect(() => {
    if (!emailSalvo) return
    const q = query(collection(db, 'suporte_mensagens'), orderBy('criadoEm'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      const filtradas = msgs.filter((m) => m.email === email)
      setMensagens(filtradas)
    })
    return () => unsubscribe()
  }, [emailSalvo, email])

  const enviarMensagem = async () => {
    if (!mensagem) return toast.error('Digite sua mensagem')
    try {
      await addDoc(collection(db, 'suporte_mensagens'), {
        nome: 'Cliente',
        email,
        mensagem,
        tipo: 'usuario',
        criadoEm: serverTimestamp(),
        resolvido: false
      })
      setMensagem('')
      toast.success('Mensagem enviada!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar')
    }
  }

  if (!emailSalvo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">📩 Central de Suporte</h1>
        <p className="mb-2 text-gray-600">Informe seu e-mail para começar a conversar com o time de suporte:</p>
        <input
          type="email"
          placeholder="seuemail@exemplo.com"
          className="border px-3 py-2 rounded w-full max-w-sm text-center mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={() => {
            if (!email.includes('@')) return toast.error('E-mail inválido')
            localStorage.setItem('suporte_email', email)
            setEmailSalvo(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Acessar chat
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💬 Suporte ao Cliente</h1>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          E-mail: <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Precisa de ajuda? Nossa equipe vai responder por aqui mesmo.
        </p>
      </div>

      <div className="border rounded p-3 h-96 overflow-y-auto bg-gray-50 mb-4">
        {mensagens.length === 0 && (
          <p className="text-gray-400 text-sm">Nenhuma mensagem ainda.</p>
        )}
        {mensagens.map((m) => (
          <div
            key={m.id}
            className={`mb-2 p-2 rounded text-sm max-w-[80%] ${m.tipo === 'admin' ? 'bg-blue-100 text-blue-800 ml-auto' : 'bg-gray-200'}`}
          >
            <strong>{m.tipo === 'admin' ? '👩‍💼 Suporte' : '👤 Você'}:</strong> {m.mensagem}
          </div>
        ))}
      </div>

      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={3}
        placeholder="Digite sua mensagem..."
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
      />
      <button
        onClick={enviarMensagem}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Enviar mensagem
      </button>
    </div>
  )
}
