import React, { useEffect, useState } from 'react'
import { auth, db } from '@/firebase'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore'

export default function RecebimentosFreela() {
  const usuario = auth.currentUser
  const [form, setForm] = useState({
    nomeTitular: '',
    cpf: '',
    banco: '',
    agencia: '',
    conta: '',
    tipoConta: '',
    chavePix: ''
  })
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [historico, setHistorico] = useState([])
  const [totalRecebido, setTotalRecebido] = useState(0)

  // Buscar dados bancários
  useEffect(() => {
    if (!usuario) {
      setCarregando(false)
      return
    }

    const fetchDados = async () => {
      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          const dados = snap.data().dadosBancarios || {}
          setForm({
            nomeTitular: dados.nomeTitular || '',
            cpf: dados.cpf || '',
            banco: dados.banco || '',
            agencia: dados.agencia || '',
            conta: dados.conta || '',
            tipoConta: dados.tipoConta || '',
            chavePix: dados.chavePix || ''
          })
        }
      } catch (err) {
        console.error('Erro ao buscar dados bancários:', err)
      } finally {
        setCarregando(false)
      }
    }

    fetchDados()
  }, [usuario])

  // Buscar histórico de trabalhos
  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        const chamadasRef = collection(db, 'chamadas')
        const q = query(
          chamadasRef,
          where('freelaUid', '==', usuario?.uid),
          where('status', 'in', ['finalizado', 'concluido']),
          orderBy('dataCandidatura', 'desc')
        )
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => {
          const data = doc.data()
          return { id: doc.id, valorPago: data.valorPago || 0, ...data }
        })
        setHistorico(lista)

        const total = lista.reduce((acc, item) => acc + (item.valorPago || 0), 0)
        setTotalRecebido(total)
      } catch (err) {
        console.error('Erro ao buscar histórico de pagamentos:', err)
      }
    }

    if (usuario?.uid) buscarHistorico()
  }, [usuario])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const salvar = async () => {
    if (!usuario) return
    setSalvando(true)
    try {
      const ref = doc(db, 'usuarios', usuario.uid)
      await updateDoc(ref, { dadosBancarios: form })
      alert('Dados bancários salvos com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro ao salvar dados.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <p className="text-center text-orange-500">Carregando dados...</p>
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* 🏦 Dados Bancários */}
      <div className="bg-white p-6 rounded-lg shadow space-y-5">
        <h2 className="text-2xl font-bold text-orange-700 mb-4">💵 Dados para Recebimento</h2>

        <input name="nomeTitular" value={form.nomeTitular} onChange={handleChange} placeholder="Nome do Titular" className="w-full border rounded px-3 py-2" />
        <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF (somente números)" className="w-full border rounded px-3 py-2" />
        <input name="banco" value={form.banco} onChange={handleChange} placeholder="Banco (ex: 001 - Banco do Brasil)" className="w-full border rounded px-3 py-2" />
        <div className="flex gap-2">
          <input name="agencia" value={form.agencia} onChange={handleChange} placeholder="Agência" className="flex-1 border rounded px-3 py-2" />
          <input name="conta" value={form.conta} onChange={handleChange} placeholder="Conta" className="flex-1 border rounded px-3 py-2" />
        </div>
        <input name="tipoConta" value={form.tipoConta} onChange={handleChange} placeholder="Tipo de Conta (corrente/poupança)" className="w-full border rounded px-3 py-2" />
        <input name="chavePix" value={form.chavePix} onChange={handleChange} placeholder="Chave PIX" className="w-full border rounded px-3 py-2" />

        <button onClick={salvar} disabled={salvando} className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar Dados'}
        </button>
      </div>

      {/* 📜 Histórico de Trabalhos */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-2xl font-bold text-green-700 mb-2">📜 Histórico de Trabalhos</h2>

        <div className="bg-green-50 text-green-700 p-3 rounded text-center font-semibold shadow-sm">
          Total recebido: R$ {totalRecebido.toFixed(2).replace('.', ',')}
        </div>

        {historico.length === 0 ? (
          <p className="text-center text-gray-600">Nenhum trabalho finalizado ainda.</p>
        ) : (
          historico.map(item => (
            <div key={item.id} className="border rounded p-3 bg-gray-50 shadow-sm">
              <p><strong>Vaga:</strong> {item.vagaTitulo || item.vagaId || 'Não informado'}</p>
              <p><strong>Estabelecimento:</strong> {item.estabelecimentoNome || item.estabelecimentoUid}</p>
              <p><strong>Data:</strong> {item.dataCandidatura?.toDate ? item.dataCandidatura.toDate().toLocaleDateString('pt-BR') : 'Não informado'}</p>
              <p><strong>Valor Recebido:</strong> R$ {Number(item.valorPago || 0).toFixed(2).replace('.', ',')}</p>
              <p><strong>Status:</strong> {item.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
