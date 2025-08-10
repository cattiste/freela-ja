// src/pages/estabelecimento/CadastroEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { uploadFoto } from '@/utils/uploadFoto'
import ContratoPrestacaoServico from '@/components/ContratoPrestacaoServico'

const VERSAO_CONTRATO = '1.0.0'

export default function CadastroEstabelecimento() {
  const navigate = useNavigate()
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [modoEdicao, setModoEdicao] = useState(false)
  const [forcarCriacao, setForcarCriacao] = useState(false)

  const [contratoOk, setContratoOk] = useState(false)
  const [contratoDefaultChecked, setContratoDefaultChecked] = useState(false)

  const [cred, setCred] = useState({ email: '', senha: '' })

  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    celular: '',
    endereco: '',
    especialidade: '',
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
              cnpj: u.cnpj || '',
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

      // 🔸 cria a conta mesmo logado quando forcarCriacao = true
      if (!uid || forcarCriacao) {
        if (!cred.email.trim()) return alert('Informe o e-mail.')
        if (!cred.senha || cred.senha.length < 6) return alert('Senha deve ter ao menos 6 caracteres.')
        const userCred = await createUserWithEmailAndPassword(auth, cred.email.trim(), cred.senha)
        uid = userCred.user.uid
      }

      if (!form.nome?.trim()) return alert('Informe o nome do estabelecimento.')
      if (!form.cnpj?.trim()) return alert('Informe o CNPJ.')
      if (!form.endereco?.trim()) return alert('Informe o endereço.')

      const ref = doc(db, 'usuarios', uid)
      const payload = {
        uid,
        email: auth.currentUser?.email || cred.email || '',
        nome: form.nome.trim(),
        cnpj: form.cnpj.trim(),
        celular: form.celular.trim(),
        endereco: form.endereco.trim(),
        especialidade: form.especialidade.trim(),
        foto: form.foto || '',
        tipoUsuario: 'estabelecimento',
        tipoConta: 'comercial',
        subtipoComercial: 'estabelecimento',
        aceitouContrato: true,
        versaoContrato: VERSAO_CONTRATO,
        dataAceiteContrato: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        criadoEm: serverTimestamp()
      }

      await setDoc(ref, payload, { merge: true })
      alert('✅ Cadastro salvo com sucesso!')
      navigate('/painelestabelecimento')
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
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-orange-700">🏪 Cadastro do Estabelecimento</h1>
          {modoEdicao && !forcarCriacao && (
            <button type="button" onClick={() => setForcarCriacao(true)} className="text-sm underline text-orange-700">
              Criar nova conta (usar outro e‑mail)
            </button>
          )}
        </div>

        {(!modoEdicao || forcarCriacao) && (
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
          <input name="nome" value={form.nome} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Ex: Churrascaria Boi na Brasa" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">CNPJ *</label>
            <input name="cnpj" value={form.cnpj} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="00.000.000/0000-00" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Celular</label>
            <input name="celular" value={form.celular} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="(11) 9 9999-9999" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço *</label>
          <input name="endereco" value={form.endereco} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Rua Exemplo, 123 - Centro - São Paulo/SP" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Especialidade</label>
          <input name="especialidade" value={form.especialidade} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Ex: Churrasco, Cozinha Brasileira, Pizzaria" />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Foto do estabelecimento</label>
          {form.foto ? (
            <div className="flex items-center gap-3">
              <img src={form.foto} alt="preview" className="w-16 h-16 rounded object-cover border" />
              <button type="button" onClick={() => setForm((p) => ({ ...p, foto: '' }))} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
                Trocar foto
              </button>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={onSelectFoto} className="w-full" />
          )}
          {uploading && <p className="text-xs text-orange-600">Enviando foto...</p>}
        </div>

        <ContratoPrestacaoServico versao={VERSAO_CONTRATO} defaultChecked={contratoDefaultChecked} onChange={setContratoOk} />

        <button
          type="submit"
          disabled={salvando || uploading || !contratoOk}
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : (!modoEdicao || forcarCriacao) ? 'Criar conta e salvar' : 'Salvar alterações'}
        </button>

        <p className="text-xs text-gray-500 text-center">Seus dados ficam visíveis para freelancers quando você abrir chamadas e vagas.</p>
      </form>
    </div>
  )
}
