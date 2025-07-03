import React, { useEffect, useState, useRef } from 'react'
import { auth, db } from '@/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore'

export default function Chat({ chamadaId }) {
  const user = auth.currentUser
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [chamada, setChamada] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!chamadaId) return

    const chamadaRef = doc(db, 'chamadas', chamadaId)
    getDoc(chamadaRef).then(docSnap => {
      if (docSnap.exists()) setChamada({ id: docSnap.id, ...docSnap.data() })
    })

    const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
    const q = query(mensagensRef, orderBy('createdAt'))

    const unsubscribe = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMensagens(msgs)
    })

    return () => unsubscribe()
  }, [chamadaId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  if (!user) return <p className="text-center text-red-600">Usuário não autenticado.</p>

  if (!chamada) return <p className="text-center text-gray-500">Carregando chat...</p>

  if (chamada.status !== 'aceita') {
    return (
      <p className="text-center text-red-600">
        Chat disponível apenas para chamadas aceitas.
      </p>
    )
  }

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || enviando) return

    setEnviando(true)
    try {
      const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
      await addDoc(mensagensRef, {
        texto: novaMensagem.trim(),
        remetenteUid: user.uid,
        createdAt: serverTimestamp()
      })
      setNovaMensagem('')
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err)
    }
    setEnviando(false)
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[600px] border rounded-lg shadow p-4 bg-white">
      <header className="border-b pb-2 mb-4">
        <h2 className="text-xl font-semibold text-orange-700">💬 Chat da Chamada</h2>
      </header>

      <div className="flex-1 overflow-y-auto mb-4">
        {mensagens.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">Nenhuma mensagem ainda.</p>
        ) : (
          mensagens.map(msg => {
            const isRemetente = msg.remetenteUid === user.uid
            return (
              <div
                key={msg.id}
                className={`mb-2 max-w-[70%] p-2 rounded ${
                  isRemetente ? 'bg-orange-100 self-end text-right' : 'bg-gray-200 self-start text-left'
                }`}
              >
                <p>{msg.texto}</p>
                <small className="text-xs text-gray-500">
                  {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString() : ''}
                </small>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={novaMensagem}
          onChange={e => setNovaMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 border rounded px-3 py-2"
          onKeyDown={e => {
            if (e.key === 'Enter') enviarMensagem()
          }}
          disabled={enviando}
        />
        <button
          onClick={enviarMensagem}
          disabled={enviando}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 rounded disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  )
}
