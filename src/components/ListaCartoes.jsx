import React, { useEffect, useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { useAuth } from '@/context/AuthContext'

const functionsClient = getFunctions(undefined, 'southamerica-east1')

export default function ListaCartoes({ refreshKey = 0 }) {
  const { usuario } = useAuth()
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [cartao, setCartao] = useState(null) // 1 doc por usuário

  useEffect(() => {
    let isMounted = true
    async function fetchCartao() {
      if (!usuario?.uid) return
      setLoading(true); setErro('')

      try {
        const fn = httpsCallable(functionsClient, 'listarCartao')
        const res = await fn()
        // espere algo como { numeroFinal, bandeira, criadoEm }
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

  if (loading) return <p>Carregando cartões…</p>
  if (erro) return <p className="text-red-600">{erro}</p>
  if (!cartao) return <p>Nenhum cartão cadastrado.</p>

  return (
    <div className="space-y-1">
      <p><strong>Bandeira:</strong> {cartao.bandeira?.toUpperCase?.() || '-'}</p>
      <p><strong>Final:</strong> •••• {cartao.numeroFinal || '----'}</p>
      {cartao.criadoEm && <p className="text-xs text-gray-500">Cadastrado em: {new Date(cartao.criadoEm).toLocaleString()}</p>}
    </div>
  )
}
