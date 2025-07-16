// src/pages/estabelecimento/ConfigPagamentoEstabelecimento.jsx
import React, { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

import { db } from '@/firebase'
import ConfiguracoesEstabelecimento from '@/pages/estabelecimento/ConfiguracoesEstabelecimento'  // caminho absoluto

export default function ConfigPagamentoEstabelecimento({ usuario }) {
  const [config, setConfig] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario?.uid) return
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'configuracoes', usuario.uid))
        if (snap.exists()) setConfig(snap.data())
      } catch (err) {
        console.error(err)
        toast.error('Erro ao carregar configurações')
      } finally {
        setCarregando(false)
      }
    }
    load()
  }, [usuario])

  const handleSalvar = async (novasConfig) => {
    try {
      await updateDoc(doc(db, 'configuracoes', usuario.uid), {
        ...novasConfig,
        atualizadoEm: serverTimestamp(),
      })
      toast.success('Configurações salvas com sucesso')
      setConfig(novasConfig)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar configurações')
    }
  }

  if (carregando) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Configurações & Pagamentos</h2>
      <ConfiguracoesEstabelecimento
        usuario={usuario}
        config={config}
        onSalvar={handleSalvar}
      />
    </div>
  )
}
