import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ChamadasEstabelecimento({ estabelecimento }) {
  const [chamadas, setChamadas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    async function carregarChamadas() {
      setCarregando(true)
      try {
        const q = query(
          collection(db, 'chamadas'),
          where('estabelecimentoUid', '==', estabelecimento.uid)
        )
        const snapshot = await getDocs(q)
        const listaChamadas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setChamadas(listaChamadas)
      } catch (err) {
        console.error('Erro ao carregar chamadas:', err)
        alert('Erro ao carregar chamadas.')
      }
      setCarregando(false)
    }

    carregarChamadas()
  }, [estabelecimento])

  function statusColor(status) {
    switch (status) {
      case 'aceita':
        return 'text-green-600 font-semibold'
      case 'recusada':
        return 'text-red-600 font-semibold'
      case 'pendente':
      default:
        return 'text-yellow-600 font-semibold'
    }
  }

  // Opcional: Função para atualizar status manualmente (se quiser dar controle ao estabelecimento)
  // async function atualizarStatus(id, novoStatus) {
  //   try {
  //     await updateDoc(doc(db, 'chamadas', id), { status: novoStatus })
  //     setChamadas((old) => old.map(c => c.id === id ? {...c, status: novoStatus} : c))
  //   } catch (err) {
  //     console.error('Erro ao atualizar status:', err)
  //   }
  // }

  if (carregando) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando chamadas...
      </div>
    )
  }

  if (chamadas.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Você ainda não fez nenhuma chamada para freelancers.
      </p>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-700 mb-4 text-center">
        📞 Minhas Chamadas
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-orange-300 rounded-lg shadow-sm">
          <thead className="bg-orange-100">
            <tr>
              <th className="border border-orange-300 px-4 py-2 text-left">Freelancer</th>
              <th className="border border-orange-300 px-4 py-2 text-left">Data da Chamada</th>
              <th className="border border-orange-300 px-4 py-2 text-left">Status</th>
              <th className="border border-orange-300 px-4 py-2 text-center">Agenda</th>
            </tr>
          </thead>
          <tbody>
            {chamadas.map(chamada => (
              <tr key={chamada.id} className="hover:bg-orange-50">
                <td className="border border-orange-300 px-4 py-2">{chamada.freelaNome}</td>
                <td className="border border-orange-300 px-4 py-2">
                  {chamada.criadoEm?.toDate
                    ? chamada.criadoEm.toDate().toLocaleString()
                    : 'Data indisponível'}
                </td>
                <td className={`border border-orange-300 px-4 py-2 ${statusColor(chamada.status || 'pendente')}`}>
                  {chamada.status ? chamada.status.charAt(0).toUpperCase() + chamada.status.slice(1) : 'Pendente'}
                </td>
                <td className="border border-orange-300 px-4 py-2 text-center">
                  {/* Aqui você pode abrir um modal ou navegar para a agenda do freela */}
                  <button
                    onClick={() => alert(`Agenda do freelancer ${chamada.freelaNome} (a implementar)`)}
                    className="btn-primary text-sm px-3 py-1"
                  >
                    Ver Agenda
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
