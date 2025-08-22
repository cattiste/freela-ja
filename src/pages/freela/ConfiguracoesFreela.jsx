// src/pages/freela/ConfiguracoesFreela.jsx
import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { sendPasswordResetEmail, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function ConfiguracoesFreela() {
  const navigate = useNavigate()

  const usuario = auth.currentUser
  const [config, setConfig] = useState({
    notificacoes: true,
    visibilidadePerfil: true,
    chamadasAutomaticas: false
  })
  const [infoConta, setInfoConta] = useState({
    email: '',
    uid: '',
    criadoEm: ''
  })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!usuario) return
    const fetchDados = async () => {
      const refUser = doc(db, 'usuarios', usuario.uid)
      const snap = await getDoc(refUser)
      if (snap.exists()) {
        const data = snap.data()
        setConfig({
          notificacoes: data.notificacoes ?? true,
          visibilidadePerfil: data.visibilidadePerfil ?? true,
          chamadasAutomaticas: data.chamadasAutomaticas ?? false
        })
        setInfoConta({
          email: usuario.email,
          uid: usuario.uid,
          criadoEm: usuario.metadata?.creationTime || ''
        })
      }
    }
    fetchDados()
  }, [usuario])

  const handleToggle = ({ target: { name, checked } }) => {
    setConfig(prev => ({ ...prev, [name]: checked }))
  }

  const salvar = async () => {
    if (!usuario) return
    setSalvando(true)
    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), config)
      alert('Configurações salvas!')
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar.')
    }
    setSalvando(false)
  }

  const redefinirSenha = async () => {
    if (!usuario) return
    try {
      await sendPasswordResetEmail(auth, usuario.email)
      alert('E-mail de redefinição enviado!')
    } catch (err) {
      console.error(err)
      alert('Erro ao enviar e-mail.')
    }
  }

  const excluirConta = async () => {
    if (!usuario) return
    if (!window.confirm('Tem certeza? Ação irreversível.')) return
    try {
      await deleteDoc(doc(db, 'usuarios', usuario.uid))
      await usuario.delete()
      alert('Conta excluída.')
      navigate('/login')
    } catch (err) {
      console.error(err)
      alert('Erro ao excluir conta. Faça login recente para confirmar.')
    }
  }

  const sair = async () => {
    try {
      await signOut(auth)
    } finally {
      localStorage.removeItem('usuarioLogado')
      navigate('/login')
    }
  }

return (
  <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-6 mt-8">
    <h2 className="text-2xl font-bold mb-4">Configurações da Conta</h2>

    {/* ⚙️ Configurações Gerais */}
    <div className="space-y-4">
      <label className="flex items-center justify-between">
        <span>Receber notificações</span>
        <input
          type="checkbox"
          name="notificacoes"
          checked={config.notificacoes}
          onChange={handleToggle}
          className="h-5 w-5"
        />
      </label>
      <label className="flex items-center justify-between">
        <span>Visibilidade do perfil</span>
        <input
          type="checkbox"
          name="visibilidadePerfil"
          checked={config.visibilidadePerfil}
          onChange={handleToggle}
          className="h-5 w-5"
        />
      </label>
      <label className="flex items-center justify-between">
        <span>Aceitar chamadas automaticamente</span>
        <input
          type="checkbox"
          name="chamadasAutomaticas"
          checked={config.chamadasAutomaticas}
          onChange={handleToggle}
          className="h-5 w-5"
        />
      </label>
    </div>

    <button
      onClick={salvar}
      disabled={salvando}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
    >
      {salvando ? 'Salvando...' : 'Salvar Configurações'}
    </button>

    {/* 🧾 Informações da Conta */}
    <div className="bg-gray-100 p-4 rounded text-sm text-gray-700 space-y-1">
      <div><strong>Email:</strong> {infoConta.email}</div>
      <div><strong>UID:</strong> {infoConta.uid}</div>
      <div><strong>Criado em:</strong> {infoConta.criadoEm}</div>
    </div>

    {/* 🔐 Segurança */}
    <div className="space-y-2">
      <button
        onClick={redefinirSenha}
        className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
      >
        Redefinir Senha
      </button>

      <button
        onClick={excluirConta}
        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
      >
        Excluir Conta
      </button>
    </div>

    {/* 🚪 Sair */}
    <button
      onClick={sair}
      className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900"
    >
      Sair da Conta
    </button>
  </div>
})