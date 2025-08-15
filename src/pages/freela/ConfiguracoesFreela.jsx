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
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      {/* ... resto igual ... */}
    </div>
  )
}
