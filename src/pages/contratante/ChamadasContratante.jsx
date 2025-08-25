// src/pages/contratante/ChamadasContratante.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

export default function ChamadasContratante() {
  const { usuario } = useAuth()

  const [chamadas, setChamadas] = useState([])
  const [senha, setSenha] = useState('')
  const [loadingPagamento, setLoadingPagamento] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [salvandoCartao, setSalvandoCartao] = useState(false)

  const [cartao, setCartao] = useState({
    numero: '', validade: '', cvv: '', nome: '', cpf: ''
  })
  const [cartaoSalvo, setCartaoSalvo] = useState(null) // ✅ Agora no local certo!

  // Buscar chamadas
  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', usuario.uid),
      where('status', 'in', ['aceita', 'checkin_freela', 'em_andamento', 'checkout_freela'])
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = []
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [usuario?.uid])

  // Buscar cartão salvo
  useEffect(() => {
    async function carregarCartao() {
      if (!usuario?.uid) return

      try {
        const r = await fetch("http://localhost:8080/listarCartao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: usuario.uid }),
        })
        const res = await r.json()
        if (res.sucesso) {
          setCartaoSalvo(res.cartao)
        }
      } catch (err) {
        console.error("Erro ao buscar cartão salvo:", err)
      }
    }

    carregarCartao()
  }, [usuario?.uid])

  const cadastrarCartao = async () => {
    setSalvandoCartao(true)
    try {
      const resposta = await fetch('http://localhost:8080/cadastrarCartao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: usuario.uid, ...cartao })
      })
      const res = await resposta.json()
      if (!res.sucesso) throw new Error(res.erro)
      toast.success('Cartão cadastrado com sucesso!')
      setModalAberto(false)
      setCartao({ numero: '', validade: '', cvv: '', nome: '', cpf: '' })
    } catch (err) {
      toast.error(`Erro ao cadastrar cartão: ${err.message}`)
    } finally {
      setSalvandoCartao(false)
    }
  }

  const confirmarPagamento = async (chamada) => {
    if (!senha) {
      toast.error('Digite sua senha para confirmar o pagamento')
      return
    }

    setLoadingPagamento(chamada.id)
    try {
      const r1 = await fetch('http://localhost:8080/confirmarPagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: usuario.uid, senha })
      })
      const res1 = await r1.json()
      if (!res1.sucesso) throw new Error(res1.erro)

      const r2 = await fetch('http://localhost:8080/pagarFreela', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chamadaId: chamada.id })
      })
      const res2 = await r2.json()
      if (!res2.sucesso) throw new Error(res2.erro)

      toast.success('Pagamento realizado com sucesso!')
    } catch (err) {
      toast.error(`Erro: ${err.message}`)
    } finally {
      setLoadingPagamento(null)
    }
  }

  const confirmarCheckIn = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'checkin_confirmado',
      checkInConfirmadoPeloContratanteHora: serverTimestamp()
    })
    toast.success('✅ Check-in confirmado')
  }

  const confirmarCheckOut = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'concluido',
      checkOutConfirmadoPeloContratanteHora: serverTimestamp()
    })
    toast.success('✅ Check-out confirmado')
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      <div className="text-center mb-4">
        <button
          onClick={() => setModalAberto(true)}
          className="bg-orange-600 text-white px-6 py-2 rounded-full shadow hover:bg-orange-700 transition"
        >
          ➕ Cadastrar Cartão
        </button>
      </div>

      {/* Modal do Cartão */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full shadow-xl space-y-3">
            <h2 className="text-xl font-bold text-orange-700 mb-2">Cadastrar Cartão</h2>
            <input type="text" placeholder="Número do Cartão" className="w-full border p-2 rounded"
              value={cartao.numero} onChange={e => setCartao({ ...cartao, numero: e.target.value })} />
            <div className="flex gap-2">
              <input type="text" placeholder="Validade (MM/AAAA)" className="w-1/2 border p-2 rounded"
                value={cartao.validade} onChange={e => setCartao({ ...cartao, validade: e.target.value })} />
              <input type="text" placeholder="CVV" className="w-1/2 border p-2 rounded"
                value={cartao.cvv} onChange={e => setCartao({ ...cartao, cvv: e.target.value })} />
            </div>
            <input type="text" placeholder="Nome impresso no cartão" className="w-full border p-2 rounded"
              value={cartao.nome} onChange={e => setCartao({ ...cartao, nome: e.target.value })} />
            <input type="text" placeholder="CPF do titular" className="w-full border p-2 rounded"
              value={cartao.cpf} onChange={e => setCartao({ ...cartao, cpf: e.target.value })} />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancelar</button>
              <button
                onClick={cadastrarCartao}
                disabled={salvandoCartao}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                {salvandoCartao ? 'Salvando...' : 'Salvar Cartão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cartão salvo */}
      <div className="mb-4 bg-white rounded-xl shadow p-4 border border-gray-300">
        <h2 className="text-lg font-bold text-orange-700 mb-2">💳 Cartão Cadastrado</h2>
        {cartaoSalvo ? (
          <p className="text-gray-700">
            <strong>Nome:</strong> {cartaoSalvo.nome}<br />
            <strong>Final:</strong> **** **** **** {cartaoSalvo.ultimos4}<br />
            <strong>Validade:</strong> {cartaoSalvo.validade}
          </p>
        ) : (
          <p className="text-gray-500">Nenhum cartão cadastrado ainda.</p>
        )}
      </div>

      {/* Chamadas */}
      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa no momento.</p>
      ) : (
        chamadas.map((chamada) => (
          <div key={chamada.id} className="bg-white shadow-md rounded-xl p-4 mb-4 space-y-2 border border-orange-300">
            <h2 className="text-lg font-semibold text-orange-600">Chamada #{chamada.id.slice(-5)}</h2>
            <p><strong>Freela:</strong> {chamada.freelaNome || chamada.freelaUid}</p>
            <p><strong>Status:</strong> {chamada.status}</p>
            <p><strong>Valor da diária:</strong> R$ {chamada.valorDiaria?.toFixed(2) || '---'}</p>
            {chamada.observacao && <p><strong>📄 Observação:</strong> {chamada.observacao}</p>}

            <div className="flex flex-col sm:flex-row gap-2">
              {chamada.status === 'aceita' && (
                <>
                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    className="border rounded p-2 w-full sm:w-auto"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <button
                    onClick={() => confirmarPagamento(chamada)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    disabled={loadingPagamento === chamada.id}
                  >
                    {loadingPagamento === chamada.id ? 'Pagando...' : 'Pagar Chamada'}
                  </button>
                </>
              )}
              {chamada.status === 'checkin_freela' && (
                <button
                  onClick={() => confirmarCheckIn(chamada.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Confirmar Check-in
                </button>
              )}
              {chamada.status === 'checkout_freela' && (
                <button
                  onClick={() => confirmarCheckOut(chamada.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Confirmar Check-out
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
