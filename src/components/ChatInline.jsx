import React, { useEffect, useState, useRef } from 'react'
import { auth, db } from '@/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export default function ChatInline({ chamadaId }) {
  const [usuario, setUsuario] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [mensagens, setMensagens] = useState([])
  const divFimRef = useRef(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUsuario(u || null)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!chamadaId) return
    const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
    const q = query(mensagensRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMensagens(msgs)
      setTimeout(() => divFimRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })

    return () => unsubscribe()
  }, [chamadaId])

  const enviarMensagem = async (e) => {
    e.preventDefault()
    if (!mensagem.trim() || !usuario) return
    const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
    await addDoc(mensagensRef, {
      texto: mensagem.trim(),
      remetenteUid: usuario.uid,
      remetenteNome: usuario.displayName || usuario.email || 'Usuário',
      createdAt: serverTimestamp()
    })
    setMensagem('')
  }
  
  return (
    <div className="mt-4 border border-orange-200 rounded-lg bg-orange-50">
      <div className="max-h-60 overflow-auto p-3 space-y-2">
        {mensagens.length === 0 && (
          <p className="text-center text-gray-500 text-sm">Nenhuma mensagem ainda.</p>
        )}
        {mensagens.map((msg) => {
          const isRemetente = msg.remetenteUid === usuario?.uid
          return (
            <div key={msg.id} className={`flex ${isRemetente ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                isRemetente ? 'bg-orange-500 text-white' : 'bg-white text-gray-800'
              }`}>
                <p className="font-semibold text-xs">{msg.remetenteNome}</p>
                <p>{msg.texto}</p>
                <p className="text-[10px] mt-1 text-right">
                  {msg.createdAt?.toDate
                    ? msg.createdAt.toDate().toLocaleTimeString('pt-BR')
                    : '...'}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={divFimRef} />
      </div>

      <form onSubmit={enviarMensagem} className="flex gap-2 p-3 border-t bg-white">
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-grow border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition text-sm"
          disabled={!mensagem.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
