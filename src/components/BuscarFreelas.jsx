import React, { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function BuscarFreelas({ estabelecimento }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)

  useEffect(() => {
    async function carregarFreelas() {
      try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'))
        const agora = new Date()
        const lista = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.tipo === 'freela') {
            let online = false
            try {
              const ultima = data.ultimaAtividade?.toDate?.()
              const segundos = (agora - ultima) / 1000
              online = segundos < 40
            } catch {}
            lista.push({ id: doc.id, ...data, online })
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
  if (freelas.length === 0) return <p>Nenhum freelancer encontrado.</p>

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {freelas.map((freela) => (
        <div key={freela.id} className="p-4 bg-white rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition">
          <div className="flex flex-col items-center mb-3">
            <img
              src={freela.foto || 'https://via.placeholder.com/80'}
              alt={freela.nome}
              className="w-20 h-20 rounded-full object-cover border-2 border-orange-400"
            />
            <h3 className="mt-2 text-lg font-bold text-orange-700 text-center">{freela.nome}</h3>
            <p className="text-sm text-gray-600 text-center">{freela.funcao}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${freela.online ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className={`text-xs ${freela.online ? 'text-green-700' : 'text-gray-500'}`}>
                {freela.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>

          <p className="text-sm text-center text-gray-500 mb-4">
            <strong>Celular:</strong> {freela.celular}
          </p>

          <button
            onClick={() => chamarFreela(freela)}
            disabled={!freela.online || chamando === freela.id}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
              freela.online
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {chamando === freela.id ? 'Chamando...' : '📞 Chamar'}
          </button>
        </div>
      ))}
    </div>
  )
}
