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
  getDoc,
  limit,
  startAfter
} from 'firebase/firestore'

const MENSAGENS_POR_PAGINA = 20

// Pequena função para tocar som (você pode colocar seu arquivo .mp3 na public/)
const playNotificationSound = () => {
  const audio = new Audio('/notification.mp3') // coloque o arquivo na pasta public do projeto
  audio.play().catch(() => {}) // evita erro no autoplay
}

export default function Chat({ chamadaId }) {
  const user = auth.currentUser
  const [chamada, setChamada] = useState(null)
  const [mensagens, setMensagens] = useState([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [loadingMais, setLoadingMais] = useState(false)
  const [temMaisMensagens, setTemMaisMensagens] = useState(true)
  const [usuariosCache, setUsuariosCache] = useState({})
  const [digitando, setDigitando] = useState(false)

  const messagesEndRef = useRef(null)
  const scrollRef = useRef(null)
  const ultimaMensagemRef = useRef(null)

  const [paginaAtual, setPaginaAtual] = useState(1)
  const ultimaMensagemCarregada = useRef(null)

  // Para debounce do "digitando"
  const digitandoTimeout = useRef(null)

  // Escuta dados da chamada e inicializa mensagens
  useEffect(() => {
    if (!chamadaId) return

    setCarregando(true)

    const chamadaRef = doc(db, 'chamadas', chamadaId)
    getDoc(chamadaRef).then(docSnap => {
      if (docSnap.exists()) {
        setChamada({ id: docSnap.id, ...docSnap.data() })
      }
    })

    // Carrega primeira página (últimas mensagens)
    const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
    const q = query(mensagensRef, orderBy('createdAt', 'desc'), limit(MENSAGENS_POR_PAGINA))

    const unsubscribe = onSnapshot(q, snapshot => {
      if (snapshot.empty) {
        setMensagens([])
        setTemMaisMensagens(false)
        setCarregando(false)
        return
      }
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setMensagens(msgs.reverse()) // ordem cronológica
      ultimaMensagemCarregada.current = snapshot.docs[snapshot.docs.length - 1]
      setTemMaisMensagens(snapshot.docs.length === MENSAGENS_POR_PAGINA)
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [chamadaId])

  // Função para carregar mais mensagens ao rolar para cima
  const carregarMaisMensagens = async () => {
    if (!temMaisMensagens || loadingMais || !ultimaMensagemCarregada.current) return
    setLoadingMais(true)
    try {
      const mensagensRef = collection(db, 'chamadas', chamadaId, 'mensagens')
      const q = query(
        mensagensRef,
        orderBy('createdAt', 'desc'),
        startAfter(ultimaMensagemCarregada.current),
        limit(MENSAGENS_POR_PAGINA)
      )
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const maisMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse()
        setMensagens(prev => [...maisMsgs, ...prev])
        ultimaMensagemCarregada.current = snapshot.docs[snapshot.docs.length - 1]
        setTemMaisMensagens(snapshot.docs.length === MENSAGENS_POR_PAGINA)
      } else {
        setTemMaisMensagens(false)
      }
    } catch (err) {
      console.error('Erro ao carregar mais mensagens:', err)
    }
    setLoadingMais(false)
  }

  // Scroll handler para detectar topo e carregar mais mensagens
  const handleScroll = e => {
    if (e.target.scrollTop === 0) {
      carregarMaisMensagens()
    }
  }

  // Carregar dados dos usuários que enviaram mensagens (cache simples)
  useEffect(() => {
    async function fetchUsuarios() {
      const uids = [...new Set(mensagens.map(m => m.remetenteUid))]
      const uidsNaoCarregados = uids.filter(uid => !usuariosCache[uid])
      if (uidsNaoCarregados.length === 0) return

      const promises = uidsNaoCarregados.map(async uid => {
        const docRef = doc(db, 'usuarios', uid)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          return { uid, data: snap.data() }
        }
        return null
      })
      const resultados = await Promise.all(promises)
      const novosUsuarios = {}
      resultados.forEach(r => {
        if (r) novosUsuarios[r.uid] = r.data
      })
      setUsuariosCache(prev => ({ ...prev, ...novosUsuarios }))
    }
    fetchUsuarios()
  }, [mensagens])

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  // Para controlar "digitando" (simples, local)
  const handleTyping = () => {
    setDigitando(true)
    clearTimeout(digitandoTimeout.current)
    digitandoTimeout.current = setTimeout(() => {
      setDigitando(false)
    }, 2000)
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
      playNotificationSound()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem. Tente novamente.')
    }
    setEnviando(false)
  }

  if (!user)
    return <p className="text-center text-red-600 mt-6">Usuário não autenticado.</p>
  if (carregando) return <p className="text-center text-gray-500 mt-6">Carregando chat...</p>
  if (!chamada)
    return <p className="text-center text-red-600 mt-6">Chamada não encontrada.</p>
  if (chamada.status !== 'aceita')
    return (
      <p className="text-center text-red-600 mt-6">
        Chat disponível apenas para chamadas aceitas.
      </p>
    )

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[600px] border rounded-lg shadow p-4 bg-white">
      <header className="border-b pb-2 mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-orange-700">💬 Chat da Chamada</h2>
        {digitando && <span className="text-sm text-gray-500 italic">Está digitando...</span>}
      </header>

      <div
        className="flex-1 overflow-y-auto mb-4 px-2 flex flex-col"
        onScroll={handleScroll}
        ref={scrollRef}
        style={{ gap: '4px' }}
      >
        {loadingMais && (
          <p className="text-center text-gray-500">Carregando mensagens anteriores...</p>
        )}
        {mensagens.length === 0 ? (
          <p className="text-center text-gray-400 mt-10">Nenhuma mensagem ainda.</p>
        ) : (
          mensagens.map(msg => {
            const isRemetente = msg.remetenteUid === user.uid
            const remetente = usuariosCache[msg.remetenteUid]
            const hora = msg.createdAt?.toDate
              ? msg.createdAt.toDate().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : ''
            return (
              <div
                key={msg.id}
                className={`max-w-[70%] p-2 rounded flex items-end gap-2 ${
                  isRemetente ? 'bg-orange-100 self-end text-right' : 'bg-gray-200 self-start text-left'
                }`}
                style={{ alignSelf: isRemetente ? 'flex-end' : 'flex-start' }}
              >
                {!isRemetente && remetente && remetente.foto && (
                  <img
                    src={remetente.foto}
                    alt={remetente.nome}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div>
                  {!isRemetente && remetente && (
                    <p className="text-sm font-semibold">{remetente.nome}</p>
                  )}
                  <p>{msg.texto}</p>
                  {hora && <small className="text-xs text-gray-500">{hora}</small>}
                </div>
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
          onChange={e => {
            setNovaMensagem(e.target.value)
            handleTyping()
          }}
          placeholder="Digite sua mensagem..."
          className="flex-1 border rounded px-3 py-2"
          onKeyDown={e => {
            if (e.key === 'Enter') enviarMensagem()
          }}
          disabled={enviando}
          autoComplete="off"
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
