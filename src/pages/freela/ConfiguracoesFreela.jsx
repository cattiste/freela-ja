import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { sendPasswordResetEmail, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function ConfiguracoesFreela() {
  const navigate = useNavigate()
  const usuario = auth.currentusuario
  const [config, setConfig] = useState({
    notificacoes: true,
    visibilidadePerfil: true,
    chamadasAutomaticas: false
  })
  const [infoConta, setInfoConta] = useState({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!usuario) return
    const fetchDados = async () => {
      const ref = doc(db, 'usuarios', usuario.uid)
      const snap = await getDoc(ref)
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
          criadoEm: usuario.metadata.creationTime
        })
      }
    }
    fetchDados()
  }, [usuario])

  const handleToggle = (e) => {
    const { name, checked } = e.target
    setConfig(prev => ({ ...prev, [name]: checked }))
  }

  const salvar = async () => {
    if (!usuario) return
    setSalvando(true)
    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), config)
      alert('Configurações salvas!')
    } catch (err) {
      alert('Erro ao salvar.')
      console.error(err)
    }
    setSalvando(false)
  }

  const redefinirSenha = async () => {
    try {
      await sendPasswordResetEmail(auth, usuario.email)
      alert('E-mail de redefinição enviado!')
    } catch (err) {
      alert('Erro ao enviar e-mail.')
      console.error(err)
    }
  }

  const excluirConta = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) return
    try {
      await deleteDoc(doc(db, 'usuarios', usuario.uid))
      await usuario.delete()
      alert('Conta excluída.')
      navigate('/login')
    } catch (err) {
      alert('Erro ao excluir conta. Faça login recente para confirmar.')
      console.error(err)
    }
  }

  const sair = async () => {
    await signOut(auth)
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-orange-700">⚙️ Configurações da Conta</h2>

      {/* Preferências */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Preferências</h3>
        <label className="flex items-center gap-3 mb-2">
          <input type="checkbox" name="notificacoes" checked={config.notificacoes} onChange={handleToggle} />
          <span>Receber notificações por e-mail</span>
        </label>
        <label className="flex items-center gap-3 mb-2">
          <input type="checkbox" name="visibilidadePerfil" checked={config.visibilidadePerfil} onChange={handleToggle} />
          <span>Perfil visível para estabelecimentos</span>
        </label>
        <label className="flex items-center gap-3 mb-2">
          <input type="checkbox" name="chamadasAutomaticas" checked={config.chamadasAutomaticas} onChange={handleToggle} />
          <span>Aceitar chamadas automáticas</span>
        </label>
      </div>

      {/* Segurança */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Segurança</h3>
        <p className="text-sm mb-2">E-mail: {infoConta.email}</p>
        <button onClick={redefinirSenha} className="text-blue-600 hover:underline">Redefinir senha</button>
      </div>

      {/* Conta */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Conta</h3>
        <p className="text-sm text-gray-600">UID: {infoConta.uid}</p>
        <p className="text-sm text-gray-600 mb-2">Criada em: {infoConta.criadoEm}</p>
        <button onClick={excluirConta} className="text-red-600 hover:underline">Excluir minha conta</button>
      </div>

      {/* Ações */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button onClick={sair} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Sair</button>
      </div>
    </div>
  )
}
