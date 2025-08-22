// src/components/ValidacaoDocumento.jsx
import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { uploadFoto } from '@/utils/uploadFoto' // ajuste se necessário
import toast from 'react-hot-toast'

export default function ValidacaoDocumento() {
  const usuario = auth.currentUser
  const [frente, setFrente] = useState(null)
  const [verso, setVerso] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [validado, setValidado] = useState(null)

  useEffect(() => {
    const fetchValidacao = async () => {
      if (!usuario) return
      const snap = await getDoc(doc(db, 'usuarios', usuario.uid))
      if (snap.exists()) {
        const data = snap.data()
        setValidado(data.validacao) // "aprovada", "pendente", etc.
      }
    }
    fetchValidacao()
  }, [usuario])

  const enviar = async () => {
    if (!frente || !verso || !usuario) {
      toast.error('Envie frente e verso do documento.')
      return
    }

    try {
      setCarregando(true)
      const urlFrente = await uploadImage(frente)
      const urlVerso = await uploadImage(verso)

      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        documentoFrente: urlFrente,
        documentoVerso: urlVerso,
        validacao: 'pendente'
      })

      toast.success('Documentos enviados para validação.')
      setValidado('pendente')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao enviar documentos.')
    } finally {
      setCarregando(false)
    }
  }

  if (validado === 'aprovada') {
    return (
      <div className="mt-6 p-4 border border-green-400 bg-green-50 rounded text-green-700 text-center font-semibold">
        ✅ Documentos verificados com sucesso.
      </div>
    )
  }

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-2">Validação de Identidade</h3>
      <p className="text-sm text-gray-600 mb-4">
        Envie uma foto da <b>frente</b> e do <b>verso</b> do seu RG ou CNH.
        Seus dados serão usados apenas para validação de segurança.
      </p>
      <div className="space-y-2">
        <input type="file" onChange={(e) => setFrente(e.target.files[0])} />
        <input type="file" onChange={(e) => setVerso(e.target.files[0])} />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={enviar}
          disabled={carregando}
        >
          {carregando ? 'Enviando...' : 'Enviar Documentos'}
        </button>
      </div>

      {validado === 'pendente' && (
        <p className="mt-3 text-sm text-yellow-700">
          ⚠️ Seus documentos estão em análise. Aguarde a validação.
        </p>
      )}
    </div>
  )
}
