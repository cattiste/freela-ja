// src/pages/suporte/PainelSuporte.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function PainelSuporte() {
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState('')
  const [mensagens, setMensagens] = useState([])
  const [resposta, setResposta] = useState({})
  const [emailsUnicos, setEmailsUnicos] = useState([])
  const [resolvidas, setResolvidas] = useState({})

  const senhaCorreta = 'suporte2025'

  useEffect(() => {
    const savedAuth = localStorage.getItem('suporte_autenticado')
    if (savedAuth === 'true') setAutenticado(true)
  }, [])

  useEffect(() => {
    if (!autenticado) return

    const q = query(collection(db, 'suporte_mensagens'), orderBy('criadoEm'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setMensagens(msgs)

      const emails = Array.from(new Set(msgs.map(m => m.email)))
      setEmailsUnicos(emails)
    }, (error) => {
      toast.error('Erro ao carregar mensagens')
      console.error(error)
    })

    return () => unsubscribe()
  }, [autenticado])

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
        resolvido: false
      })
      toast.success('Resposta enviada!')
      setResposta((prev) => ({ ...prev, [email]: '' }))
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar resposta')
    }
  }

  const marcarResolvido = async (msgId) => {
    try {
      await updateDoc(doc(db, 'suporte_mensagens', msgId), { resolvido: true })
      setResolvidas((prev) => ({ ...prev, [msgId]: true }))
    } catch (error) {
      toast.error('Erro ao marcar como resolvido')
      console.error(error)
    }
  }

  if (!autenticado) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">🔐 Acesso ao Painel de Suporte</h1>
        <input
          type="password"
          placeholder="Digite a senha"
          className="border p-2 rounded mb-3 w-full max-w-xs text-center"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <button
          onClick={() => {
            if (senha === senhaCorreta) {
              setAutenticado(true)
              localStorage.setItem('suporte_autenticado', 'true')
              toast.success('Acesso liberado!')
            } else {
              toast.error('Senha incorreta')
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📊 Painel de Suporte</h1>

      {emailsUnicos.length === 0 ? (
        <p className="text-gray-500">Nenhuma mensagem ainda.</p>
      ) : (
        emailsUnicos.map((email) => (
          <div key={email} className="mb-6 border rounded p-4 bg-gray-50 shadow">
            <h2 className="font-semibold mb-2">{email}</h2>

            {mensagens
              .filter((m) => m.email === email)
              .map((m) => (
                <div
                  key={m.id}
                  className={`mb-1 p-2 rounded text-sm ${m.tipo === 'admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100'} flex justify-between items-center`}
                >
                  <span>
                    <strong>{m.tipo === 'admin' ? '💼 Suporte:' : `👤 ${m.nome || 'Usuário'}:`}</strong> {m.mensagem}
                  </span>
                  {!m.resolvido && m.tipo !== 'admin' && (
                    <button
                      onClick={() => marcarResolvido(m.id)}
                      className="text-xs text-green-700 hover:underline"
                    >
                      Marcar como resolvido
                    </button>
                  )}
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
        ))
      )}
    </div>
  )
}
