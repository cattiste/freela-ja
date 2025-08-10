// src/pages/pf/CadastroPessoaFisica.jsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'

export default function CadastroPessoaFisica() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    celular: '',
    endereco: '',
    foto: ''
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login')
        return
      }

      try {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          const u = snap.data()
          setForm((prev) => ({
            ...prev,
            nome: u.nome || '',
            cpf: u.cpf || '',
            celular: u.celular || '',
            endereco: u.endereco || '',
            foto: u.foto || ''
          }))
        } else {
          setForm((prev) => ({ ...prev, nome: user.displayName || '' }))
        }
      } catch (e) {
        console.error('Erro ao carregar usuário:', e)
      } finally {
        setCarregando(false)
      }
    })
    return () => unsub()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!auth.currentUser?.uid) return

    if (!form.nome?.trim()) return alert('Informe o nome.')
    if (!form.endereco?.trim()) return alert('Informe o endereço.')

    setSalvando(true)
    try {
      const uid = auth.currentUser.uid
      const ref = doc(db, 'usuarios', uid)

      const payload = {
        uid,
        email: auth.currentUser.email || '',
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        celular: form.celular.trim(),
        endereco: form.endereco.trim(),
        foto: form.foto || '',
        tipoConta: 'comercial',
        subtipoComercial: 'pf',
        atualizadoEm: serverTimestamp(),
        criadoEm: serverTimestamp()
      }

      await setDoc(ref, payload, { merge: true })
      alert('✅ Cadastro salvo com sucesso!')
      navigate('/pf')
    } catch (e) {
      console.error('Erro ao salvar cadastro:', e)
      alert('Erro ao salvar cadastro.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <div className="p-6 text-center text-orange-600">Carregando...</div>
  }

  return (
    <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
      <form onSubmit={salvar} className="bg-white w-full max-w-xl rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-orange-700 text-center">👤 Cadastro Pessoa Física</h1>

        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input name="nome" value={form.nome} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">CPF</label>
            <input name="cpf" value={form.cpf} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="000.000.000-00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Celular</label>
            <input name="celular" value={form.celular} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="(11) 9 9999-9999" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço *</label>
          <input name="endereco" value={form.endereco} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL da Foto (opcional)</label>
          <input name="foto" value={form.foto} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="https://..." />
        </div>

        <button type="submit" disabled={salvando} className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar cadastro'}
        </button>
      </form>
    </div>
  )
}
