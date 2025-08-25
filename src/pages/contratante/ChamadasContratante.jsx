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
        body: JSON.stringify({ uid: usuario.uid, senha }),
      })
      const res1 = await r1.json()

      if (!res1.sucesso) throw new Error(res1.erro)

      const r2 = await fetch('http://localhost:8080/pagarFreela', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chamadaId: chamada.id }),
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
      checkInConfirmadoPeloContratanteHora: serverTimestamp(),
    })
    toast.success('✅ Check-in confirmado')
  }

  const confirmarCheckOut = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'concluido',
      checkOutConfirmadoPeloContratanteHora: serverTimestamp(),
    })
    toast.success('✅ Check-out confirmado')
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

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
