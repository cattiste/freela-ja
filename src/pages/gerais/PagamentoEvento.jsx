import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { toast } from 'react-hot-toast'

export default function PagamentoEvento() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagando, setPagando] = useState(false)

  useEffect(() => {
    const buscarEvento = async () => {
      try {
        const ref = doc(db, 'eventos', id)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setEvento({ id: snap.id, ...snap.data() })
        } else {
          toast.error('Evento não encontrado.')
        }
      } catch (err) {
        console.error(err)
        toast.error('Erro ao buscar evento.')
      } finally {
        setLoading(false)
      }
    }

    buscarEvento()
  }, [id])

  const confirmarPagamento = async () => {
    if (!evento) return
    setPagando(true)
    try {
      const ref = doc(db, 'eventos', evento.id)
      await updateDoc(ref, {
        status: 'pago',
        pagoEm: serverTimestamp()
      })
      toast.success('Pagamento confirmado!')
      navigate('/evento-confirmado')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao confirmar pagamento.')
    } finally {
      setPagando(false)
    }
  }

  if (loading) return <p className="text-center mt-10">Carregando evento...</p>
  if (!evento) return <p className="text-center mt-10">Evento não encontrado.</p>

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Pagamento do Evento</h1>

      <div className="space-y-2 text-sm text-gray-700">
        <p><strong>Título:</strong> {evento.titulo}</p>
        <p><strong>Descrição:</strong> {evento.descricao}</p>
        <p><strong>Data:</strong> {new Date(evento.dataEvento).toLocaleDateString()}</p>
        <p><strong>Cidade:</strong> {evento.cidade}</p>
        <p><strong>Contato:</strong> {evento.contato}</p>
      </div>

      <div className="mt-6">
        <button
          onClick={confirmarPagamento}
          disabled={pagando}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {pagando ? 'Processando pagamento...' : 'Confirmar pagamento'}
        </button>
      </div>
    </div>
  )
}
