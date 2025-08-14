// src/pages/contratante/EditarPerfilContratante.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { uploadFoto } from '@/utils/uploadFoto'

export default function EditarPerfilContratante() {
  const { usuario } = useAuth()
  const [form, setForm] = useState({
    nome: '',
    cpfCnpj: '',
    celular: '',
    endereco: '',
    foto: ''
  })
  const [salvando, setSalvando] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const data = snap.data()
          setForm({
            nome: data.nome || '',
            cpfCnpj: data.cpfCnpj || '',
            celular: data.celular || '',
            endereco: data.endereco || '',
            foto: data.foto || ''
          })
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
      }
    }
    if (usuario?.uid) fetchPerfil()
  }, [usuario])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onSelectFoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadFoto(file)
      setForm((p) => ({ ...p, foto: url }))
    } catch (err) {
      console.error(err)
      alert('Erro ao enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!usuario?.uid) return alert('Usuário não identificado.')
    setSalvando(true)
    try {
      const ref = doc(db, 'usuarios', usuario.uid)
      await setDoc(ref, {
        ...form,
        atualizadoEm: serverTimestamp()
      }, { merge: true })
      alert('✅ Perfil atualizado!')
    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      alert('Erro ao salvar perfil.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 mb-4">✏️ Editar Perfil</h1>
      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">CPF ou CNPJ</label>
          <input name="cpfCnpj" value={form.cpfCnpj} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Celular</label>
          <input name="celular" value={form.celular} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input name="endereco" value={form.endereco} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Foto</label>
          {form.foto ? (
            <div className="flex items-center gap-3">
              <img src={form.foto} alt="foto" className="w-16 h-16 rounded object-cover border" />
              <button type="button" onClick={() => setForm((p) => ({ ...p, foto: '' }))} className="text-sm underline">
                Trocar foto
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={onSelectFoto} className="w-full" />
          )}
          {uploading && <p className="text-sm text-orange-600">Enviando foto...</p>}
        </div>

        <button
          type="submit"
          disabled={salvando || uploading}
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar'}</button>
      </form>
    </div>
  )
}
