import React, { useEffect, useState, useRef } from 'react'
import { auth, db } from '@/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore'

export default function Chat({ chamadaId }) {
  const [usuario, setUsuario] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const [mensagens, setMensagens] = useState([])
  const divFimRef = useRef(null)

  // Pega usuário atual
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUsuario(user)
      else setUsuario(null)
    })
    return unsubscribe
  }, [])

  // Escuta mensagens da chamada
  useEffect(() => {
    if (!chamadaId) return

    const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
    const q = query(mensagensRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setMensagens(msgs)

      // Scroll automático para o final
      setTimeout(() => {
        if (divFimRef.current) divFimRef.current.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    })

    return () => unsubscribe()
  }, [chamadaId])

  // Envia mensagem para Firestore
  const enviarMensagem = async (e) => {
    e.preventDefault()
    if (!mensagem.trim()) return
    if (!usuario) return alert('Usuário não autenticado')

    const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
    try {
      await addDoc(mensagensRef, {
        texto: mensagem.trim(),
        remetenteUid: usuario.uid,
        remetenteNome: usuario.displayName || usuario.email || 'Usuário',
        createdAt: serverTimestamp()
      })
      setMensagem('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    }
  }

  return (
    <div className="flex flex-col h-[500px] max-w-2xl mx-auto border rounded shadow p-4 bg-white">
      <div className="flex-grow overflow-auto mb-4 space-y-2">
        {mensagens.length === 0 && (
          <p className="text-gray-500 text-center mt-10">Nenhuma mensagem ainda.</p>
        )}
        {mensagens.map((msg) => {
          const isRemetente = msg.remetenteUid === usuario?.uid
          return (
            <div
              key={msg.id}
              className={`flex ${isRemetente ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-lg ${
                  isRemetente ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-xs font-semibold">{msg.remetenteNome}</p>
                <p>{msg.texto}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {msg.createdAt?.toDate
                    ? msg.createdAt.toDate().toLocaleString()
                    : 'Enviando...'}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={divFimRef} />
      </div>

      <form onSubmit={enviarMensagem} className="flex gap-2">
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-grow border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
          disabled={!mensagem.trim()}
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
