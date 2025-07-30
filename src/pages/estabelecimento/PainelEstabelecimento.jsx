import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/firebase'

import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'
import CardAvaliacaoFreela from '@/components/CardAvaliacaoFreela'
import AgendaEstabelecimento from '@/components/AgendaEstabelecimento'

export default function PainelEstabelecimento() {
  const { usuario, carregando } = useAuth()
  const [aba, setAba] = useState('perfil')
  const [chamadasAtivas, setChamadasAtivas] = useState([])
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!carregando && (!usuario || usuario.tipo !== 'estabelecimento')) {
      navigate('/')
    }
  }, [usuario, carregando, navigate])

  // Buscar chamadas ativas e pendentes de avaliação
  useEffect(() => {
    if (!usuario?.uid) return

    const carregarDados = async () => {
      const chamadasQ = query(
        collection(db, 'chamadas'),
        where('estabelecimentoUid', '==', usuario.uid)
      )
      const snap = await getDocs(chamadasQ)
      const ativas = []
      const pendentes = []

      for (const docSnap of snap.docs) {
        const chamada = { id: docSnap.id, ...docSnap.data() }

        // Buscar info do freela
        const freelaSnap = await getDoc(doc(db, 'usuarios', chamada.freelaUid))
        if (!freelaSnap.exists()) continue
        chamada.freela = { ...freelaSnap.data(), uid: chamada.freelaUid }

        // Chamadas ativas com status em andamento
        if (
          ['aceita', 'checkin_freela'].includes(chamada.status)
        ) {
          ativas.push(chamada)
        }

        // Chamadas finalizadas sem avaliação
        if (chamada.status === 'finalizada') {
          const avaliacaoQ = query(
            collection(db, 'avaliacoes'),
            where('tipo', '==', 'freela'),
            where('chamadaId', '==', chamada.id)
          )
          const avaliacaoSnap = await getDocs(avaliacaoQ)
          if (avaliacaoSnap.empty) {
            pendentes.push(chamada)
          }
        }
      }

      setChamadasAtivas(ativas)
      setAvaliacoesPendentes(pendentes)
    }

    carregarDados()
  }, [usuario])

  const confirmarStatus = async (id, novoStatus) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: novoStatus,
      })
      setChamadasAtivas((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      console.error('Erro ao confirmar status:', e)
    }
  }

  if (carregando || !usuario) return <p className="p-4">Carregando...</p>

  return (
    <div className="pb-20">
      {aba === 'perfil' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {/* Coluna 1: Dados do Estabelecimento */}
          <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
            <img
              src={usuario.foto || 'https://via.placeholder.com/100'}
              alt={usuario.nome}
              className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-orange-500 mx-auto"
            />
            <h2 className="text-center text-xl font-bold text-orange-700">
              {usuario.nome}
            </h2>
            <p className="text-center text-sm text-gray-600 mb-4">
              {usuario.funcao} — {usuario.especialidade}
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p>📞 {usuario.telefone}</p>
              <p>📧 {usuario.email}</p>
              <p>📍 {usuario.endereco}</p>
              <p>🧾 {usuario.cnpj}</p>
              <p>💰 R$ {usuario.valorDiaria},00 / diária</p>
            </div>
          </div>

          {/* Coluna 2: Agenda */}
          <div>
            <AgendaEstabelecimento />
          </div>

          {/* Coluna 3: Chamadas ativas + Avaliações pendentes */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-orange-700 mb-2">Chamadas Ativas</h3>
              {chamadasAtivas.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma chamada ativa no momento.</p>
              ) : (
                chamadasAtivas.map((chamada) => (
                  <div
                    key={chamada.id}
                    className="border border-orange-300 p-3 rounded-lg bg-white mb-2"
                  >
                    <p className="font-semibold">{chamada.freela.nome}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Status atual: {chamada.status}
                    </p>
                    {chamada.status === 'checkin_freela' && (
                      <button
                        onClick={() => confirmarStatus(chamada.id, 'checkin_confirmado')}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                      >
                        Confirmar Check-in
                      </button>
                    )}
                    {chamada.status === 'checkout_freela' && (
                      <button
                        onClick={() => confirmarStatus(chamada.id, 'finalizada')}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                      >
                        Confirmar Check-out
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div>
              <h3 className="font-bold text-orange-700 mt-6 mb-2">Freelas a Avaliar</h3>
              {avaliacoesPendentes.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum freela para avaliar no momento.</p>
              ) : (
                avaliacoesPendentes.map((chamada) => (
                  <CardAvaliacaoFreela
                    key={chamada.id}
                    chamada={chamada}
                    onAvaliado={(id) =>
                      setAvaliacoesPendentes((prev) =>
                        prev.filter((c) => c.id !== id)
                      )
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {aba === 'buscar' && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Buscar Freelas</h2>
          {/* Aqui entra o componente de busca de freelas online */}
        </div>
      )}

      {/* As outras abas seguem normalmente, se quiser posso completar depois */}

      <MenuInferiorEstabelecimento abaAtual={aba} setAba={setAba} />
    </div>
  )
}
