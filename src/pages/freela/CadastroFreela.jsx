// src/pages/freela/CadastroFreela.jsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'
import { uploadFoto } from '@/utils/uploadFoto'
import ContratoPrestacaoServico from '@/components/ContratoPrestacaoServico'

const VERSAO_CONTRATO = '1.0.0'

export default function CadastroFreela() {
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
    funcao: '',
    especialidades: '',
    valorDiaria: '',
    celular: '',
    cidade: '',
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
              funcao: u.funcao || '',
              especialidades: Array.isArray(u.especialidades) ? u.especialidades.join(', ') : (u.especialidades || ''),
              valorDiaria: u.valorDiaria || '',
              celular: u.celular || '',
              cidade: u.cidade || '',
              endereco: u.endereco || '',
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
      const wantsNewAccount = forcarCriacao || (!!cred.email.trim() || !!cred.senha)
      let uid = auth.currentUser?.uid

      if (!uid && !wantsNewAccount) {
        alert('Informe e-mail e senha para criar a conta.')
        setSalvando(false)
        return
      }

      if (wantsNewAccount) {
        if (!cred.email.trim()) return alert('Informe o e-mail.')
        if (!cred.senha || cred.senha.length < 6) return alert('Senha deve ter ao menos 6 caracteres.')
        const userCred = await createUserWithEmailAndPassword(auth, cred.email.trim(), cred.senha)
        uid = userCred.user.uid
      }

      if (!form.nome?.trim()) return alert('Informe seu nome.')
      if (!form.funcao?.trim()) return alert('Informe sua função.')

      if (!uid) {
        alert('Não foi possível identificar o usuário. Faça login ou preencha e-mail e senha para criar uma conta.')
        setSalvando(false)
        return
      }      
      const ref = doc(db, 'usuarios', uid)
      const payload = {
        uid,
        email: auth.currentUser?.email || cred.email || '',
        nome: form.nome.trim(),
        funcao: form.funcao.trim(),
        especialidades: form.especialidades
          ? form.especialidades.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        valorDiaria: form.valorDiaria ? Number(form.valorDiaria) : null,
        celular: form.celular.trim(),
        cidade: form.cidade.trim(),
        endereco: form.endereco.trim(),
        foto: form.foto || '',
        tipoUsuario: 'freela',
        tipoConta: 'funcional',
        aceitouContrato: true,
        versaoContrato: VERSAO_CONTRATO,
        dataAceiteContrato: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
        criadoEm: serverTimestamp()
      }

      await setDoc(ref, payload, { merge: true })
      alert('✅ Cadastro salvo com sucesso!')
      navigate('/painelfreela')
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
          <h1 className="text-2xl font-bold text-orange-700">🧑‍🍳 Cadastro de Freela</h1>
          {modoEdicao && !forcarCriacao && (
            <button type="button" onClick={() => setForcarCriacao(true)} className="text-sm underline text-orange-700">
              Criar nova conta (usar outro e-mail)
            </button>
          )}
        </div>

        {/* Campos SEMPRE visíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail {(!modoEdicao || forcarCriacao) && '*'}</label>
            <input
              name="email"
              type="email"
              value={cred.email}
              onChange={handleCred}
              className="w-full border rounded px-3 py-2"
              required={!modoEdicao || forcarCriacao}
            />
            {modoEdicao && !forcarCriacao && (
              <p className="text-xs text-gray-500 mt-1">Opcional em modo edição. Preencha para criar outra conta.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha {(!modoEdicao || forcarCriacao) && '*'}</label>
            <input
              name="senha"
              type="password"
              value={cred.senha}
              onChange={handleCred}
              className="w-full border rounded px-3 py-2"
              required={!modoEdicao || forcarCriacao}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nome *</label>
          <input name="nome" value={form.nome} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Função *</label>
            <input name="funcao" value={form.funcao} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Ex: Churrasqueiro" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor da diária (R$)</label>
            <input name="valorDiaria" type="number" value={form.valorDiaria} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Especialidades (separadas por vírgula)</label>
          <input name="especialidades" value={form.especialidades} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Grelha, Fogo de chão, Saladas" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Celular</label>
            <input name="celular" value={form.celular} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cidade</label>
            <input name="cidade" value={form.cidade} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Endereço</label>
          <input name="endereco" value={form.endereco} onChange={handleChange} className="w-full border rounded px-3 py-2" />
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

        <ContratoPrestacaoServico versao={VERSAO_CONTRATO} defaultChecked={contratoDefaultChecked} onChange={setContratoOk} />

        <button
          type="submit"
          disabled={salvando || uploading || !contratoOk}
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : (!modoEdicao || forcarCriacao) ? 'Criar conta e salvar' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
