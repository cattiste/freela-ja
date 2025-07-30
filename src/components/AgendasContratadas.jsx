import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

export default function AgendasContratadas({ estabelecimento }) {
  const [agendasPorData, setAgendasPorData] = useState({})

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid)
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chamadas = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const chamada = { id: docSnap.id, ...docSnap.data() }

        // Busca o freela da chamada
        const freelaSnap = await getDoc(doc(db, 'usuarios', chamada.freelaUid))
        chamada.freela = freelaSnap.exists() ? freelaSnap.data() : {}

        return chamada
      }))

      // Agrupa por data
      const agrupado = {}
      chamadas.forEach((chamada) => {
        if (!chamada.data) return

        const dataFormatada = format(chamada.data.toDate(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

        if (!agrupado[dataFormatada]) agrupado[dataFormatada] = []
        agrupado[dataFormatada].push(chamada)
      })

      setAgendasPorData(agrupado)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  const datasOrdenadas = Object.keys(agendasPorData).sort((a, b) => {
    const parse = (str) => new Date(str.split(' de ').reverse().join('-'))
    return parse(a) - parse(b)
  })

  if (datasOrdenadas.length === 0) return <p className="text-gray-500">Nenhuma agenda marcada ainda.</p>

  return (
    <div className="space-y-6">
      {datasOrdenadas.map((data) => (
        <div key={data}>
          <h3 className="text-lg font-bold text-orange-700 mb-2">{data}</h3>
          <div className="space-y-2">
            {agendasPorData[data].map((chamada) => (
              <div
                key={chamada.id}
                className="bg-white border border-orange-300 p-3 rounded shadow"
              >
                <p><strong>Freela:</strong> {chamada.freela.nome || '—'}</p>
                <p><strong>Função:</strong> {chamada.freela.funcao || '—'}</p>
                <p><strong>Vaga:</strong> {chamada.vagaTitulo || '—'}</p>
                <p><strong>Status:</strong> {chamada.status}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
