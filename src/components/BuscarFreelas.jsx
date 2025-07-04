import React, { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function BuscarFreelas({ estabelecimento }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const agora = new Date()
  const ultimoPing = data.ultimaAtividade?.toDate?.()
  const segundos = (agora - ultimoPing) / 1000

   if (segundos < 40) {
     // Usuário está "ativo agora"
   }

  useEffect(() => {
    async function carregarFreelas() {
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'))
        const lista = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()

          if (
            data.tipo === 'freela' &&
            data.ativo === true &&
            data.online === true &&
            data.nome &&
            data.funcao &&
            data.celular
          ) {
            lista.push({ id: doc.id, ...data })
          }
        })

        setFreelas(lista)
      } catch (err) {
        console.error('Erro ao buscar freelancers:', err)
      } finally {
        setCarregando(false)
      }
    }

    carregarFreelas()
  }, [])

  const chamarFreela = async (freela) => {
    if (!estabelecimento?.uid) return
    setChamando(freela.id)

    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: freela.id,
        freelaNome: freela.nome,
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome,
        vagaTitulo: 'Serviço direto',
        status: 'pendente',
        criadoEm: serverTimestamp()
      })

      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      alert('Erro ao chamar freelancer.')
    }

    setChamando(null)
  }

  if (carregando) return <p>Carregando freelancers...</p>
  if (freelas.length === 0) return <p>Nenhum freelancer online no momento.</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {freelas.map((freela) => (
        <div key={freela.id} className="p-4 bg-white rounded-xl shadow-md">
          <div className="flex items-center gap-4 mb-2">
            <img
              src={freela.foto || 'https://via.placeholder.com/80'}
              alt={freela.nome}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <p className="font-bold text-lg">{freela.nome}</p>
              <p className="text-sm text-gray-600">{freela.funcao}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-700 font-medium">Online</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-2">
            <strong>Celular:</strong> {freela.celular}
          </p>

          <button
            onClick={() => chamarFreela(freela)}
            disabled={chamando === freela.id}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-xl transition disabled:opacity-50"
          >
            {chamando === freela.id ? 'Chamando...' : '📞 Chamar'}
          </button>
        </div>
      ))}
    </div>
  )
}
