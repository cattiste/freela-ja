import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
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
        const ref = doc(db, 'eventosPublicos', id)
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
      const ref = doc(db, 'eventosPublicos', evento.id)
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
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-4">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Pagamento do Evento</h1>
      <div className="space-y-2 text-sm text-gray-700">
        <p><strong>Contratante:</strong> {evento.nome}</p>
        <p><strong>Tipo:</strong> {evento.tipoEvento}</p>
        <p><strong>Data:</strong> {new Date(evento.dataHora).toLocaleString()}</p>
        <p><strong>Endereço:</strong> {evento.endereco}</p>
        <p><strong>Funções:</strong> {evento.funcoes.join(', ')}</p>
        <p><strong>Valor:</strong> R$ {parseFloat(evento.valor).toFixed(2)}</p>
      </div>

      <button
        onClick={confirmarPagamento}
        disabled={pagando}
        className="w-full mt-6 bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        {pagando ? 'Processando pagamento...' : 'Confirmar pagamento'}
      </button>
    </div>
  )
}
