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
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import ChamadasEstabelecimento from '@/pages/estabelecimento/ChamadasEstabelecimento'
import VagasDisponiveis from '@/pages/estabelecimento/VagasDisponiveis'
import AvaliacoesRecebidasEstabelecimento from '@/pages/estabelecimento/AvaliacoesRecebidasEstabelecimento'
import HistoricoChamadasEstabelecimento from '@/pages/estabelecimento/HistoricoChamadasEstabelecimento'
import ConfiguracoesEstabelecimento from '@/pages/estabelecimento/ConfiguracoesEstabelecimento'
import CardAvaliacaoFreela from '@/components/CardAvaliacaoFreela'

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

export default function PainelEstabelecimento() {
  const { usuario, carregando } = useAuth()
  const [aba, setAba] = useState('perfil')
  const [chamadasAtivas, setChamadasAtivas] = useState([])
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const [datasAgendadas, setDatasAgendadas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!carregando && (!usuario || usuario.tipo !== 'estabelecimento')) {
      navigate('/')
    }
  }, [usuario, carregando, navigate])

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
      const datas = new Set()

      for (const docSnap of snap.docs) {
        const chamada = { id: docSnap.id, ...docSnap.data() }

        const freelaSnap = await getDoc(doc(db, 'usuarios', chamada.freelaUid))
        if (!freelaSnap.exists()) continue
        chamada.freela = { ...freelaSnap.data(), uid: chamada.freelaUid }

        if (chamada.data) {
          datas.add(chamada.data.toDate().toDateString())
        }

        if (['aceita', 'checkin_freela'].includes(chamada.status)) {
          ativas.push(chamada)
        }

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
      setDatasAgendadas([...datas])
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

  const tileClassName = ({ date }) => {
    if (datasAgendadas.includes(date.toDateString())) {
      return 'bg-orange-200 text-black font-bold rounded-lg'
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white pb-28">
      {aba === 'perfil' && (
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
              <img
                src={usuario.foto || 'https://via.placeholder.com/100'}
                alt={usuario.nome}
                className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-orange-500 mx-auto"
              />
              <h2 className="text-center text-xl font-bold text-orange-700">{usuario.nome}</h2>
              <p className="text-center text-sm text-gray-600 mb-4">
                {usuario.funcao} — {usuario.especialidade}
              </p>
              <div className="text-sm text-gray-700 space-y-1">
                <p>📞 {usuario.telefone || 'Telefone não informado'}</p>
                <p>📧 {usuario.email}</p>
                <p>📍 {usuario.endereco}</p>
                <p>🧾 {usuario.cnpj}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
              <h3 className="text-lg font-bold text-orange-700 mb-2">Minha Agenda</h3>
              <Calendar
                tileClassName={tileClassName}
                tileContent={({ date }) =>
                  datasAgendadas.includes(date.toDateString()) ? (
                    <div className="dot-indicator" />
                  ) : null
                }
              />
              <p className="text-xs text-gray-500 mt-2">
                Datas em laranja indicam eventos, entrevistas ou agendamentos.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-orange-700 mb-2">Freelas a Avaliar</h3>
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

          <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
            <h3 className="text-lg font-bold text-orange-700 mb-3">Chamadas Ativas</h3>
            {chamadasAtivas.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma chamada ativa no momento.</p>
            ) : (
              <div className="space-y-3">
                {chamadasAtivas.map((chamada) => (
                  <div
                    key={chamada.id}
                    className="border border-orange-200 p-3 rounded-lg bg-orange-50"
                  >
                    <p className="font-semibold">{chamada.freela.nome}</p>
                    <p className="text-sm text-gray-600 mb-2">Status: {chamada.status}</p>
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
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {aba === 'buscar' && <BuscarFreelas />}      
      {aba === 'agendas' && <AgendasContratadas estabelecimento={usuario} />}      
      {aba === 'ativas' && <ChamadasEstabelecimento />}      
      {aba === 'vagas' && <VagasDisponiveis />}      
      {aba === 'avaliacao' && <AvaliacoesRecebidasEstabelecimento />}      
      {aba === 'historico' && <HistoricoChamadasEstabelecimento />}      
      {aba === 'configuracoes' && <ConfiguracoesEstabelecimento />}      

      <MenuInferiorEstabelecimento abaAtiva={aba} onSelect={setAba} />
    </div>
  )
}
