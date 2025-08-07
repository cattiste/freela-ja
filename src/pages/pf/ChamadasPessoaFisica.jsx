import React, { useEffect, useState } from 'react'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import AvaliacaoInline from '@/components/AvaliacaoInline'
import MensagensRecebidasEstabelecimento from '@/components/MensagensRecebidasEstabelecimento'

export default function ChamadasPessoaFisica() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('pessoaFisicaUid', '==', usuario.uid)
    )

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsub()
  }, [usuario])

  const confirmarCheckIn = async (chamada) => {
    await updateDoc(doc(db, 'chamadas', chamada.id), {
      checkInEstabelecimento: true,
      checkInEstabelecimentoHora: serverTimestamp(),
      status: 'checkin_estabelecimento'
    })
  }

  const confirmarCheckOut = async (chamada) => {
    await updateDoc(doc(db, 'chamadas', chamada.id), {
      checkOutEstabelecimento: true,
      checkOutEstabelecimentoHora: serverTimestamp(),
      status: 'concluido'
    })
  }

  return (
    <div className="space-y-4">
      {chamadas.map((chamada) => (
        <div key={chamada.id} className="bg-white p-4 rounded-xl shadow border border-orange-200">
          <div className="flex items-center gap-4">
            <img
              src={chamada.fotoFreela || 'https://via.placeholder.com/100'}
              className="w-20 h-20 rounded-full object-cover border"
            />
            <div>
              <h2 className="font-bold text-lg text-orange-700">{chamada.nomeFreela}</h2>
              <p className="text-sm text-gray-600">Função: {chamada.funcao}</p>
              <p className="text-sm text-gray-600">Valor diária: R$ {chamada.valorDiaria}</p>
              <p className="text-xs text-gray-500">Status: {chamada.status}</p>
            </div>
          </div>

          {chamada.observacao && (
            <div className="mt-2 text-sm text-gray-700">
              <span className="font-semibold">🔎 Observação:</span> {chamada.observacao}
            </div>
          )}

          <div className="mt-4 space-y-2">
            {!chamada.pagamentoConfirmado && (
              <button className="bg-green-600 text-white px-4 py-2 rounded shadow">
                Aguardando Pagamento...
              </button>
            )}

            {chamada.checkInFreela && !chamada.checkInEstabelecimento && (
              <button
                onClick={() => confirmarCheckIn(chamada)}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow"
              >
                Confirmar Check-in
              </button>
            )}

            {chamada.checkOutFreela && !chamada.checkOutEstabelecimento && (
              <button
                onClick={() => confirmarCheckOut(chamada)}
                className="bg-red-600 text-white px-4 py-2 rounded shadow"
              >
                Confirmar Check-out
              </button>
            )}

            {chamada.status === 'concluido' && (
              <AvaliacaoInline chamada={chamada} tipo="pf" />
            )}
          </div>

          <div className="mt-2">
            <MensagensRecebidasEstabelecimento chamada={chamada} />
          </div>
        </div>
      ))}
    </div>
  )
}
