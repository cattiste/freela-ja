// src/components/ListaCartoes.jsx
import React, { useEffect, useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functionsClient } from '@/utils/firebaseFunctions'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function ListaCartoes({ refreshKey = 0 }) {
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [cartao, setCartao] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function fetchCartao() {
      if (!usuario?.uid) return
      setLoading(true); setErro('')

      try {
        const fn = httpsCallable(functionsClient, 'listarCartao')
        const res = await fn()
        const data = res?.data
        if (isMounted) setCartao(data || null)
      } catch (e) {
        console.error('[ListaCartoes] listarCartao', e)
        if (isMounted) setErro(e?.message || 'Erro ao listar cartão.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchCartao()
    return () => { isMounted = false }
  }, [usuario?.uid, refreshKey])

  async function excluirCartao() {
    try {
      const fn = httpsCallable(functionsClient, 'excluirCartao')
      await fn()
      toast.success('Cartão excluído.')
      setCartao(null) // limpa a UI local
    } catch (e) {
      console.error('[ListaCartoes] excluirCartao', e)
      toast.error(e?.message || 'Erro ao excluir cartão.')
    }
  }

  if (loading) return <p>Carregando cartões…</p>
  if (erro) return <p className="text-red-600">{erro}</p>
  if (!cartao) return <p>Nenhum cartão cadastrado.</p>

  return (
    <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
      <p><strong>Bandeira:</strong> {cartao.brand?.toUpperCase?.() || '-'}</p>
      <p><strong>Final:</strong> •••• {cartao.last4 || cartao.numeroFinal || '----'}</p>
      {cartao.expMonth && cartao.expYear && (
        <p><strong>Validade:</strong> {cartao.expMonth}/{cartao.expYear}</p>
      )}
      <div className="flex justify-between items-center">
        {cartao.criadoEm && (
          <p className="text-xs text-gray-500">
            Cadastrado em: {new Date(cartao.criadoEm).toLocaleString()}
          </p>
        )}
        <button
          onClick={excluirCartao}
          className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          🗑️ Excluir
        </button>
      </div>
    </div>
  )
}
