import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatarDataBR(v) {
  if (!v) return '-'
  try {
    // Firestore Timestamp
    if (typeof v === 'object' && v?.toDate) return v.toDate().toLocaleDateString('pt-BR')
    // epoch (ms)
    if (typeof v === 'number') return new Date(v).toLocaleDateString('pt-BR')
    // ISO string
    const d = new Date(v)
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR')
  } catch {}
  return '-'
}

export default function PagamentoEvento() {
  const { id } = useParams()
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagando, setPagando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    async function buscarEvento() {
      if (!id) {
        setErro('ID do evento inválido.')
        setLoading(false)
        return
      }
      setLoading(true)
      setErro('')
      try {
        const ref = doc(db, 'eventos', id)
        const snap = await getDoc(ref)
        if (!ativo) return
        if (snap.exists()) {
          setEvento({ id: snap.id, ...snap.data() })
        } else {
          setErro('Evento não encontrado.')
          toast.error('Evento não encontrado.')
        }
      } catch (err) {
        console.error(err)
        setErro('Erro ao buscar evento.')
        toast.error('Erro ao buscar evento.')
      } finally {
        if (ativo) setLoading(false)
      }
    }
    buscarEvento()
    return () => { ativo = false }
  }, [id])

  const valorNumero = useMemo(() => {
    const v = Number(evento?.valor)
    return Number.isFinite(v) && v > 0 ? v : 1 // fallback mínimo
  }, [evento])

  const iniciarPagamento = async () => {
    if (!evento || pagando) return
    setPagando(true)
    try {
      const res = await fetch('/api/gerarCheckout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: evento.titulo || 'Evento',
          valor: valorNumero,
          referenciaId: evento.id,
          tipo: 'evento'
        })
      })

      // garante tratamento de erros HTTP
      let data = null
      try {
        data = await res.json()
      } catch {
        // se a API não retornar JSON válido
        data = null
      }

      if (!res.ok) {
        console.error('Checkout erro HTTP', res.status, data)
        toast.error(data?.message || 'Erro ao iniciar pagamento.')
        return
      }

      if (data?.linkPagamento) {
        // redireciona para o provedor
        window.location.assign(data.linkPagamento)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
        <div className="max-w-xl w-full bg-white p-6 rounded-xl shadow text-center">
          <p>Carregando evento...</p>
        </div>
      </div>
    )
  }

  if (erro || !evento) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
        <div className="max-w-xl w-full bg-white p-6 rounded-xl shadow text-center">
          <p className="text-red-600">{erro || 'Evento não encontrado.'}</p>
          <Link to="/" className="inline-block mt-4 text-orange-600 hover:underline">Voltar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      <div className="max-w-xl w-full bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-orange-700 mb-4">Pagamento do Evento</h1>

        <div className="space-y-2 text-sm text-gray-800">
          <p><strong>Título:</strong> {evento.titulo || '-'}</p>
          {evento.descricao && <p><strong>Descrição:</strong> {evento.descricao}</p>}
          <p><strong>Data:</strong> {formatarDataBR(evento.dataEvento)}</p>
          {evento.cidade && <p><strong>Cidade:</strong> {evento.cidade}</p>}
          {evento.contato && <p><strong>Contato:</strong> {evento.contato}</p>}
          <p><strong>Valor:</strong> {fmtBRL.format(valorNumero)}</p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={iniciarPagamento}
            disabled={pagando}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition disabled:opacity-60"
            aria-busy={pagando}
          >
            {pagando ? 'Gerando link de pagamento...' : 'Pagar com Pagar.me'}
          </button>

          <Link
            to="/"
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Voltar
          </Link>
        </div>
      </div>
    </div>
  )
}
