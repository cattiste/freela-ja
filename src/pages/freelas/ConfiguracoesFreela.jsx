import React, { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

export default function ConfiguracoesFreela() {
  const [config, setConfig] = useState({
    notificacoes: true,
    visibilidadePerfil: true
  })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const user = auth.currentUser

  useEffect(() => {
    if (!user) return
    const fetchConfig = async () => {
      setCarregando(true)
      try {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          setConfig({
            notificacoes: data.notificacoes ?? true,
            visibilidadePerfil: data.visibilidadePerfil ?? true
          })
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error)
      } finally {
        setCarregando(false)
      }
    }
    fetchConfig()
  }, [user])

  const handleChange = e => {
    const { name, checked } = e.target
    setConfig(prev => ({ ...prev, [name]: checked }))
  }

  const salvarConfiguracoes = async () => {
    if (!user) return
    setSalvando(true)
    try {
      const ref = doc(db, 'usuarios', user.uid)
      await updateDoc(ref, config)
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      alert('Erro ao salvar configurações.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <p className="text-orange-600 text-center">Carregando configurações...</p>

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-orange-700">⚙️ Configurações</h2>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="notificacoes"
          checked={config.notificacoes}
          onChange={handleChange}
          className="h-5 w-5 text-orange-600"
        />
        <span>Receber notificações por e-mail</span>
      </label>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="visibilidadePerfil"
          checked={config.visibilidadePerfil}
          onChange={handleChange}
          className="h-5 w-5 text-orange-600"
        />
        <span>Perfil público visível para estabelecimentos</span>
      </label>

      <button
        onClick={salvarConfiguracoes}
        disabled={salvando}
        className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar Configurações'}
      </button>
    </div>
  )
}
