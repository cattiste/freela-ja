// src/components/ValidacaoDocumento.jsx
import React, { useState } from 'react'
import { db } from '@/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import axios from 'axios'

export default function ValidacaoDocumento() {
  const { usuario } = useAuth()
  const [frente, setFrente] = useState(null)
  const [verso, setVerso] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const handleUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'preset-publico')

    const res = await axios.post('https://api.cloudinary.com/v1_1/dbemvuau3/image/upload', formData)
    return res.data.secure_url
  }

  const enviarDocumentos = async () => {
    if (!frente || !verso) return alert('Envie frente e verso do documento.')
    setEnviando(true)

    try {
      const urlFrente = await handleUpload(frente)
      const urlVerso = await handleUpload(verso)

      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        documentoFrente: urlFrente,
        documentoVerso: urlVerso,
        validacao: 'pendente'
      })

      alert('Documentos enviados com sucesso! Aguarde a validação.')
    } catch (err) {
      console.error(err)
      alert('Erro ao enviar documentos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2">Validação de Identidade</h2>
      <p className="text-sm mb-4 text-gray-600">
        Envie uma foto da <strong>frente</strong> e do <strong>verso</strong> do seu RG ou CNH. Seus dados serão usados apenas para validação de segurança.
      </p>

      <div className="mb-2">
        <label className="block text-sm font-medium">Frente do documento</label>
        <input type="file" accept="image/*" onChange={(e) => setFrente(e.target.files[0])} />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium">Verso do documento</label>
        <input type="file" accept="image/*" onChange={(e) => setVerso(e.target.files[0])} />
      </div>

      <button
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={enviarDocumentos}
        disabled={enviando}
      >
        {enviando ? 'Enviando...' : 'Enviar Documentos'}
      </button>
    </div>
  )
}
