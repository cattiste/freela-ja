// src/pages/pf/CadastroPessoaFisica.jsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import ContratoPrestacaoServico from '@/components/ContratoPrestacaoServico'

const VERSAO_CONTRATO = '1.0.0'
const CLOUD_NAME = 'dbemvuau3'
const UPLOAD_PRESET = 'preset-publico'

async function uploadFoto(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  const res = await fetch(url, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Falha no upload da imagem')
  const data = await res.json()
  return data.secure_url
}

export default function CadastroPessoaFisica() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [contratoOk, setContratoOk] = useState(false)
  const [contratoDefaultChecked, setContratoDefaultChecked] = useState(false)

  const [cred, setCred] = useState({ email: '', senha: '' })

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    celular: '',
    endereco: '',
    foto: ''
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setModoEdicao(true)
          const ref = doc(db, 'usuarios', user.uid)
          const snap = await getDoc(ref)
          if (snap.exists()) {
            const u = snap.data()
            setForm({
              nome: u.nome || '',
              cpf: u.cpf || '',
              celular: u.celular || '',
              endereco: u.endereco || '',
              foto: u.foto || ''
            })
            // se já aceitou a mesma versão, libera direto
            if (u.aceitouContrato && u.versaoContrato === VERSAO_CONTRATO) {
              setContratoOk(true)
              setContratoDefaultChecked(true)
            }
          } else {
            setForm((p) => ({ ...p, nome: user.displayName || '' }))
          }
        } else {
          setModoEdicao(false)
        }
      } catch (e) {
        console.error('Erro ao carregar usuário:', e)
      } finally {
        setCarregando(false)
      }
    })
    return () => unsub()
  }, [])

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  const handleCred = (e) => setCred((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const onSelectFoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadFoto(file)
      setForm((p) => ({ ...p, foto: url }))
    } catch (err) {
      console.error(err)
      alert('Não foi possível enviar a foto.')
    } finally {
      setUploading(false)
    }
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!contratoOk) return
    setSalvando(true)
    try {
      let uid = auth.currentUser?.uid
      if (!uid) {
        if (!cred.email.trim()) return alert('Informe o e-mail.')
        if (!cred.senha || cred.senha.length < 6) return alert('Senha deve ter ao menos 6 caracteres.')
        const userCred = await createUserWithEmailAndPassword(auth, cred.email.trim(), cred.senha)
        uid = userCred.user.uid
      }

      if (!form.nome?.trim()) return alert('Informe o nome.')
      if (!form.endereco?.trim()) return alert('Informe o endereço.')

      const ref = doc(db, 'usuarios', uid)
      const payload = {
        uid,
        email: auth.currentUser?.email || cred.email || '',
        nome: form.nome.trim(),
        cpf: form.cpf.trim(),
        celular: form.celular.trim(),
        endereco: form.endereco.trim(),
        foto: form.foto || '',
        tipo: 'pessoa_fisica',
        tipoConta: 'comercial',
        subtipoComercial: 'pf',
        aceitouContrato: true,
        versaoContrato: VERSAO_CONTRATO,
        dataAceiteContrato: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        criadoEm: serverTimestamp()
      }

      await setDoc(ref, payload, { merge: true })
      alert('✅ Cadastro salvo com sucesso!')
      navigate('/pf')
    } catch (e2) {
      console.error('Erro ao salvar cadastro:', e2)
      alert('Erro ao salvar cadastro.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <div className="p-6 text-center text-orange-600">Carregando...</div>

  return (
    <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
      <form onSubmit={salvar} className="bg-white w-full max-w-xl rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-orange-700 text-center">👤 Cadastro Pessoa Física</h1>

        {!modoEdicao && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">E-mail *</label>
              <input name="email" type="email" value={cred.email} onChange={handleCred} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha *</label>
              <input name="senha" type="password" value={cred.senha} onChange={handleCred} className="w-full border rounded px-3 py-2" required />
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>
          </div>
        )}

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

        <div className="space-y-2">
          <label className="block text-sm font-medium">Foto de perfil</label>
          {form.foto ? (
            <div className="flex items-center gap-3">
              <img src={form.foto} alt="preview" className="w-16 h-16 rounded-full object-cover border" />
              <button type="button" onClick={() => setForm((p) => ({ ...p, foto: '' }))} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                Trocar foto
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={onSelectFoto} className="w-full" />
          )}
          {uploading && <p className="text-xs text-orange-600">Enviando foto...</p>}
        </div>

        <ContratoPrestacaoServico
          versao={VERSAO_CONTRATO}
          defaultChecked={contratoDefaultChecked}
          onChange={setContratoOk}
        />

        <button
          type="submit"
          disabled={salvando || uploading || !contratoOk}
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Criar conta e salvar'}
        </button>
      </form>
    </div>
  )
}
