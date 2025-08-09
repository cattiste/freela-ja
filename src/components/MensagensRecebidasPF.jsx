import React, { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function MensagensRecebidasPF() {
  const { usuario } = useAuth()
  const [mensagens, setMensagens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [marcandoComoLida, setMarcandoComoLida] = useState(null)

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'mensagensPF'),
      where('destinatarioUid', '==', usuario.uid),
      where('destinatarioTipo', '==', 'pessoa_fisica'),
      where('status', 'in', ['enviada', 'recebida', 'lida'])
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensagensData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Converter timestamp para Date
        dataEnvio: doc.data().dataEnvio?.toDate() || new Date()
      }))
      
      // Ordenar por data (mais recente primeiro)
      mensagensData.sort((a, b) => b.dataEnvio - a.dataEnvio)
      setMensagens(mensagensData)
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [usuario])

  const marcarComoLida = async (mensagemId) => {
    try {
      setMarcandoComoLida(mensagemId)
      await updateDoc(doc(db, 'mensagensPF', mensagemId), {
        status: 'lida',
        dataLeitura: serverTimestamp()
      })
      toast.success('Mensagem marcada como lida')
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error)
      toast.error('Erro ao atualizar mensagem')
    } finally {
      setMarcandoComoLida(null)
    }
  }

  const formatarData = (date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (carregando) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-orange-600">Carregando mensagens...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-orange-700 mb-6">✉️ Mensagens Recebidas</h2>
        
        {mensagens.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhuma mensagem recebida ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mensagens.map((mensagem) => (
              <div 
                key={mensagem.id} 
                className={`border rounded-lg p-4 ${
                  mensagem.status === 'lida' ? 'bg-gray-50' : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-orange-700">
                      De: {mensagem.remetenteNome || 'Remetente desconhecido'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatarData(mensagem.dataEnvio)}
                    </p>
                  </div>
                  
                  {mensagem.status !== 'lida' && (
                    <button
                      onClick={() => marcarComoLida(mensagem.id)}
                      disabled={marcandoComoLida === mensagem.id}
                      className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 disabled:opacity-50"
                    >
                      {marcandoComoLida === mensagem.id ? 'Salvando...' : 'Marcar como lida'}
                    </button>
                  )}
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Assunto:</p>
                  <p className="font-medium">{mensagem.assunto || 'Sem assunto'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Mensagem:</p>
                  <p className="whitespace-pre-line">{mensagem.conteudo}</p>
                </div>
                
                {mensagem.servicoTitulo && (
                  <div className="mt-3 p-2 bg-gray-100 rounded">
                    <p className="text-sm font-medium text-gray-700">Relacionado ao serviço:</p>
                    <p className="font-medium text-orange-700">{mensagem.servicoTitulo}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}