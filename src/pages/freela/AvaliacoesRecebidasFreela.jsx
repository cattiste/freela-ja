// src/pages/freela/AvaliacoesRecebidasFreela.jsx
import React, { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore"
import { db } from "@/firebase"
import { FaStar, FaRegStar } from "react-icons/fa"

function Estrelas({ nota }) {
  return (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) =>
        i < nota ? <FaStar key={i} /> : <FaRegStar key={i} />
      )}
    </div>
  )
}

export default function AvaliacoesRecebidasFreela({ freelaUid }) {
  const [avaliacoes, setAvaliacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!freelaUid) return

    let unsub
    async function carregarAvaliacoes() {
      try {
        const q = query(
          collection(db, "avaliacoesFreelas"),
          where("freelaUid", "==", freelaUid),
          orderBy("criadoEm", "desc")
        )

        unsub = onSnapshot(q, (snap) => {
          const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          setAvaliacoes(lista)
          setLoading(false)
        })
      } catch (err) {
        console.warn("⚠️ Fallback sem índice:", err.message)

        // fallback: busca sem orderBy, ordena manualmente
        const snap = await getDocs(
          query(collection(db, "avaliacoesFreelas"), where("freelaUid", "==", freelaUid))
        )
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        lista.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0))
        setAvaliacoes(lista)
        setLoading(false)
      }
    }

    carregarAvaliacoes()
    return () => unsub && unsub()
  }, [freelaUid])

  if (loading) return <p className="text-center">Carregando avaliações...</p>

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-bold text-orange-600 mb-3">
        ⭐ Avaliações Recebidas
      </h2>

      {avaliacoes.length === 0 ? (
        <p className="text-gray-600 text-center">
          Nenhuma avaliação recebida ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {avaliacoes.slice(0, 3).map((av) => (
            <div
              key={av.id}
              className="border rounded-lg p-3 shadow-sm bg-gray-50"
            >
              <Estrelas nota={av.nota || 0} />
              <p className="text-sm text-gray-700 mt-1">{av.comentario || "Sem comentário"}</p>
              <p className="text-xs text-gray-500 mt-1">
                Contratante: {av.contratanteNome || "---"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
