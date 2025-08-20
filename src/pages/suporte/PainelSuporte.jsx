// src/pages/suporte/PainelSuporte.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function PainelSuporte() {
  const [mensagens, setMensagens] = useState([])
  const [resposta, setResposta] = useState({})
  const [emailsUnicos, setEmailsUnicos] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'suporte_mensagens'), orderBy('criadoEm'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setMensagens(msgs)

      const emails = Array.from(new Set(msgs.map(m => m.email)))
      setEmailsUnicos(emails)
    })
    return () => unsubscribe()
  }, [])

  const handleResponder = async (email) => {
    const texto = resposta[email]
    if (!texto) return toast.error('Mensagem em branco')
    try {
      await addDoc(collection(db, 'suporte_mensagens'), {
        nome: 'Equipe de Suporte',
        email,
        mensagem: texto,
        tipo: 'admin',
        remetenteUid: null,
        criadoEm: serverTimestamp(),
      })
      toast.success('Resposta enviada!')
      setResposta((prev) => ({ ...prev, [email]: '' }))
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar')
    }
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Painel de Suporte</h1>

      {emailsUnicos.map((email) => (
        <div key={email} className="mb-6 border rounded p-4 bg-gray-50 shadow">
          <h2 className="font-semibold mb-2">{email}</h2>

          {mensagens
            .filter((m) => m.email === email)
            .map((m) => (
              <div key={m.id} className={`mb-1 p-2 rounded text-sm ${m.tipo === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>
                <strong>{m.tipo === 'admin' ? '💼 Suporte:' : `👤 ${m.nome || 'Usuário'}:`}</strong> {m.mensagem}
              </div>
            ))}

          <textarea
            className="w-full mt-3 mb-2 p-2 border rounded"
            rows={3}
            placeholder="Responder..."
            value={resposta[email] || ''}
            onChange={(e) => setResposta({ ...resposta, [email]: e.target.value })}
          />

          <button
            onClick={() => handleResponder(email)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enviar resposta
          </button>
        </div>
      ))}
    </div>
  )
}
