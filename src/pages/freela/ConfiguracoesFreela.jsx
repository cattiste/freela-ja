import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { sendPasswordResetEmail, signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

export default function ConfiguracoesFreela() {
  const navigate = useNavigate()

  // pega o usuário corretamente:
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
        {['notificacoes','visibilidadePerfil','chamadasAutomaticas'].map(name => (
          <label key={name} className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              name={name}
              checked={config[name]}
              onChange={handleToggle}
            />
            <span>
              {{
                notificacoes: 'Receber notificações por e-mail',
                visibilidadePerfil: 'Perfil visível para estabelecimentos',
                chamadasAutomaticas: 'Aceitar chamadas automáticas'
              }[name]}
            </span>
          </label>
        ))}
      </div>

      {/* Segurança */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Segurança</h3>
        <p className="text-sm mb-2">E-mail: {infoConta.email}</p>
        <button onClick={redefinirSenha} className="text-blue-600 hover:underline">
          Redefinir senha
        </button>
      </div>

      {/* Conta */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Conta</h3>
        <p className="text-sm text-gray-600">UID: {infoConta.uid}</p>
        <p className="text-sm text-gray-600 mb-2">Criada em: {infoConta.criadoEm}</p>
        <button onClick={excluirConta} className="text-red-600 hover:underline">
          Excluir minha conta
        </button>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={() => navigate('/freela/editarperfil')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          ✏️ Editar Perfil
        </button>
        <button
          onClick={salvar}
          disabled={salvando}
          className="bg-orange-600 text-white px-4 py-2 rounded"
        >
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
        <button
          onClick={sair}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Sair
        </button>
      </div>