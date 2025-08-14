// src/pages/contratante/CadastroContratante.jsx
import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import { uploadFoto } from '@/utils/uploadFoto'
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import ContratoPrestacaoServico from '@/components/ContratoPrestacaoServico'
import InputMask from 'react-input-mask'

const VERSAO_CONTRATO = '1.0.0'

export default function CadastroContratante() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [forcarCriacao, setForcarCriacao] = useState(false)
  const [contratoOk, setContratoOk] = useState(false)
  const [contratoDefaultChecked, setContratoDefaultChecked] = useState(false)

  const [cred, setCred] = useState({ email: '', senha: '' })
  const [form, setForm] = useState({
    nome: '',
    cpfOuCnpj: '',
    celular: '',
    endereco: '',
    especialidade: '',
    foto: ''
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setModoEdicao(true)
        const snap = await getDoc(doc(db, 'usuarios', user.uid))
        if (snap.exists()) {
          const u = snap.data()
          setForm({
            nome: u.nome || '',
            cpfOuCnpj: u.cpfOuCnpj || '',
            celular: u.celular || '',
            endereco: u.endereco || '',
            especialidade: u.especialidade || '',
            foto: u.foto || ''
          })
          if (u.aceitouContrato && u.versaoContrato === VERSAO_CONTRATO) {
            setContratoOk(true)
            setContratoDefaultChecked(true)
          }
        }
      }
      setCarregando(false)
    })
    return () => unsub()
  }, [])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const handleCred = (e) => setCred((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onSelectFoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadFoto(file)
      setForm((p) => ({ ...p, foto: url }))
    } catch {
      alert('Erro ao enviar foto.')
    }
  }

  const salvar = async (e) => {
    e.preventDefault()
    if (!contratoOk) return
    let uid = auth.currentUser?.uid
    const wantsNewAccount = forcarCriacao || (!!cred.email && !!cred.senha)
    if (!uid && !wantsNewAccount) return alert('Preencha e-mail e senha.')

    if (wantsNewAccount) {
      if (!cred.email.trim()) return alert('E-mail obrigatório')
      if (!cred.senha || cred.senha.length < 6) return alert('Senha muito curta')
      const credUser = await createUserWithEmailAndPassword(auth, cred.email.trim(), cred.senha)
      uid = credUser.user.uid
    }

    if (!form.nome || !form.cpfOuCnpj || !form.endereco) {
      return alert('Preencha os campos obrigatórios.')
    }

    const digitsOnly = form.cpfOuCnpj.replace(/\D/g, '')
    const tipoConta = digitsOnly.length === 14 ? 'estabelecimento' : 'pessoa_fisica'

    const payload = {
      uid,
      email: auth.currentUser?.email || cred.email || '',
      nome: form.nome,
      cpfOuCnpj: form.cpfOuCnpj,
      celular: form.celular,
      endereco: form.endereco,
      especialidade: form.especialidade,
      foto: form.foto,
      tipo: 'contratante',
      tipoConta,
      aceitouContrato: true,
      versaoContrato: VERSAO_CONTRATO,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp()
    }

    await setDoc(doc(db, 'usuarios', uid), payload, { merge: true })
    alert('✅ Cadastro salvo com sucesso!')
    navigate('/painelcontratante')
  }

  if (carregando) return <div className="p-6 text-orange-600">Carregando...</div>

  return (
    <div className="min-h-screen p-6 bg-orange-50 flex justify-center items-center">
      <form onSubmit={salvar} className="bg-white w-full max-w-xl rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-orange-700">Cadastro do Contratante</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label>Email*</label>
            <input type="email" name="email" value={cred.email} onChange={handleCred} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label>Senha*</label>
            <input type="password" name="senha" value={cred.senha} onChange={handleCred} required className="w-full border px-3 py-2 rounded" />
          </div>
        </div>

        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome completo ou fantasia" required className="w-full border px-3 py-2 rounded" />

        <InputMask
          mask={form.cpfOuCnpj.replace(/\D/g, '').length > 11 ? '99.999.999/9999-99' : '999.999.999-99'}
          name="cpfOuCnpj"
          value={form.cpfOuCnpj}
          onChange={handleChange}
          placeholder="CPF ou CNPJ"
          required
          className="w-full border px-3 py-2 rounded"
        />

        <InputMask
          mask="(99) 99999-9999"
          name="celular"
          value={form.celular}
          onChange={handleChange}
          placeholder="Celular"
          className="w-full border px-3 py-2 rounded"
        />

        <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço" required className="w-full border px-3 py-2 rounded" />
        <input name="especialidade" value={form.especialidade} onChange={handleChange} placeholder="Especialidade" className="w-full border px-3 py-2 rounded" />

        <div>
          <label>Foto (opcional)</label>
          <input type="file" accept="image/*" onChange={onSelectFoto} />
          {form.foto && <img src={form.foto} alt="preview" className="w-20 h-20 mt-2 object-cover rounded" />}
        </div>

        <ContratoPrestacaoServico versao={VERSAO_CONTRATO} defaultChecked={contratoDefaultChecked} onChange={setContratoOk} />

        <button type="submit" disabled={!contratoOk} className="w-full bg-orange-600 text-white py-2 rounded">
          Salvar
        </button>
      </form>
    </div>
  )
}
