import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function PagamentoChamada() {
  const { id } = useParams() // id da chamada
  const navigate = useNavigate()
  const [chamada, setChamada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagando, setPagando] = useState(false)

  useEffect(() => {
    const buscarChamada = async () => {
      try {
        const ref = doc(db, 'chamadas', id)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setChamada({ id: snap.id, ...snap.data() })
        } else {
          toast.error('Chamada não encontrada.')
        }
      } catch (err) {
        console.error(err)
        toast.error('Erro ao buscar chamada.')
      } finally {
        setLoading(false)
      }
    }

    buscarChamada()
  }, [id])

  const iniciarPagamento = async () => {
    if (!chamada || !chamada.valorDiaria || !chamada.freelaNome) {
      toast.error('Informações da chamada incompletas.')
      return
    }

    setPagando(true)
    try {
      const valorTotal = chamada.valorDiaria * 1.1 // inclui taxa de 10%

      const res = await fetch('/api/gerarCheckout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: `Diária de ${chamada.freelaNome}`,
          valor: valorTotal,
          referenciaId: chamada.id,
          tipo: 'chamada'
        })
      })

      const data = await res.json()
      if (data.linkPagamento) {
        window.location.href = data.linkPagamento
      } else {
        toast.error('Erro ao iniciar pagamento.')
      }

    } catch (err) {
      console.error(err)
      toast.error('Erro na comunicação com o pagamento.')
    } finally {
      setPagando(false)
    }
  }

  if (loading) return <p className="text-center mt-10">Carregando chamada...</p>
  if (!chamada) return <p className="text-center mt-10">Chamada não encontrada.</p>

  const valorTotal = chamada.valorDiaria * 1.1

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">Pagamento da Chamada</h1>

      <div className="text-gray-700 space-y-2 text-sm">
        <p><strong>Freela:</strong> {chamada.freelaNome}</p>
        <p><strong>Função:</strong> {chamada.funcao}</p>
        <p><strong>Valor da diária:</strong> R$ {parseFloat(chamada.valorDiaria).toFixed(2)}</p>
        <p><strong>Taxa da plataforma (10%):</strong> R$ {(chamada.valorDiaria * 0.1).toFixed(2)}</p>
        <p><strong>Total:</strong> <span className="text-green-700 font-bold">R$ {valorTotal.toFixed(2)}</span></p>
      </div>

      <button
        onClick={iniciarPagamento}
        disabled={pagando}
        className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        {pagando ? 'Processando pagamento...' : 'Pagar e Confirmar Chamada'}
      </button>
    </div>
  )
}
