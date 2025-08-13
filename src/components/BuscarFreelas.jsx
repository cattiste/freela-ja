import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function BuscarFreelas({ origem, tipoUsuario }) {
  const { usuario } = useAuth()
  const [freelas, setFreelas] = useState([])
  const [mostrarOnline, setMostrarOnline] = useState(true)

  useEffect(() => {
    if (!usuario?.localizacao) return
    const carregarFreelas = async () => {
      const statusSnap = await getDocs(collection(db, 'status'))
      const statusMap = {}
      statusSnap.forEach((doc) => {
        statusMap[doc.id] = doc.data().state
      })

      const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
      const snap = await getDocs(q)

      const lista = []

      snap.forEach((docUser) => {
        const data = docUser.data()
        const status = statusMap[docUser.id] || 'offline'

        if (mostrarOnline && status !== 'online') return

        const distancia = calcularDistancia(
          usuario.localizacao.latitude,
          usuario.localizacao.longitude,
          data.localizacao?.latitude || 0,
          data.localizacao?.longitude || 0
        )

        lista.push({
          id: docUser.id,
          ...data,
          status,
          distancia,
        })
      })

      lista.sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1
        if (a.status !== 'online' && b.status === 'online') return 1
        return a.distancia - b.distancia
      })

      setFreelas(lista)
    }

    carregarFreelas()
  }, [usuario?.localizacao, mostrarOnline])

  const criarChamada = async (freelaId) => {
    if (!usuario?.uid || !freelaId) return
    const docFreela = await getDoc(doc(db, 'usuarios', freelaId))
    const dataFreela = docFreela.data()

    const agora = new Date()
    const dataFormatada = agora
      .toISOString()
      .replace(/[-:.]/g, '')
      .slice(0, 15)

    const chamadaId = `${usuario.uid}_${dataFormatada}`

    await addDoc(collection(db, 'chamadas'), {
      chamadaId,
      criadoEm: serverTimestamp(),
      status: 'pendente',
      estabelecimentoUid: usuario.uid,
      freelaUid: freelaId,
      valor: dataFreela.valorDiaria || 100,
      nomeFreela: dataFreela.nome,
      nomeEstabelecimento: usuario.nome,
      localEstabelecimento: usuario.localizacao,
    })
    alert('Chamada enviada!')
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Buscar Freelancers</h2>
      <label className="block mb-4">
        <input
          type="checkbox"
          checked={mostrarOnline}
          onChange={() => setMostrarOnline(!mostrarOnline)}
          className="mr-2"
        />
        Mostrar somente freelancers online
      </label>

      {freelas.map((freela) => (
        <div
          key={freela.id}
          className="mb-4 p-4 border rounded shadow bg-white flex flex-col"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold">{freela.nome}</p>
              <p className="text-sm text-gray-600">{freela.funcao}</p>
              <p className="text-sm text-gray-500">
                Distância: {freela.distancia.toFixed(2)} km
              </p>
              <p className="text-sm text-gray-500">
                Diária: R$ {freela.valorDiaria || 'N/D'}
              </p>
              <p
                className={`text-sm ${
                  freela.status === 'online' ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {freela.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
            <button
              onClick={() => criarChamada(freela.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Chamar
            </button>
          </div>
        </div>
      ))}

      {freelas.length === 0 && (
        <p className="text-gray-600">Nenhum freelancer encontrado.</p>
      )}
    </div>
  )
}
