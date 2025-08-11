// src/pages/estabelecimento/PainelEstabelecimento.jsx
import React, { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  doc, getDocs, collection, query, where, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import VagasEstabelecimentoCompleto from '@/components/VagasEstabelecimentoCompleto'
import AvaliacoesRecebidasEstabelecimento from '@/pages/estabelecimento/AvaliacoesRecebidasEstabelecimento'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'
import ChamadasEstabelecimento from '@/pages/estabelecimento/ChamadasEstabelecimento'
import CardAvaliacaoFreela from '@/components/CardAvaliacaoFreela'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

export default function PainelEstabelecimento() {
  const { usuario, carregando } = useAuth()
  const nav = useNavigate()

  // garante que só estabelecimentos acessem
  const estabelecimento = usuario?.tipo === 'estabelecimento' ? usuario : null

  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const [agendaPerfil, setAgendaPerfil] = useState({})

  // placeholder se quiser reativar presença no futuro
  const usuariosOnline = {}

  // Atualiza última atividade quando entrar no painel
  useEffect(() => {
    const marcarUltimaAtividade = async () => {
      try {
        if (!estabelecimento?.uid) return
        await updateDoc(doc(db, 'usuarios', estabelecimento.uid), {
          ultimaAtividade: serverTimestamp()
        })
      } catch (err) {
        console.warn('[PainelEstabelecimento] Não foi possível marcar ultimaAtividade:', err)
      }
    }
    marcarUltimaAtividade()
  }, [estabelecimento?.uid])

  // Carrega dados dependentes do uid
  useEffect(() => {
    if (!estabelecimento?.uid) return
    carregarAgenda(estabelecimento.uid)
    carregarAvaliacoesPendentes(estabelecimento.uid)
  }, [estabelecimento?.uid])

  const carregarAgenda = async (uid) => {
    try {
      const ref = collection(db, 'usuarios', uid, 'agenda')
      const snap = await getDocs(ref)
      const datas = {}
      snap.docs.forEach(d => {
        datas[d.id] = d.data()
      })
      setAgendaPerfil(datas)
    } catch (err) {
      console.error('Erro ao carregar agenda do perfil:', err)
    }
  }

  const carregarAvaliacoesPendentes = async (uid) => {
    try {
      const ref = collection(db, 'chamadas')
      const q = query(
        ref,
        where('estabelecimentoUid', '==', uid),
        where('status', '==', 'concluido')
      )
      const snap = await getDocs(q)
      const pendentes = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(chamada => !chamada.avaliacaoFreela?.nota)

      setAvaliacoesPendentes(pendentes)
    } catch (err) {
      console.error('Erro ao buscar chamadas pendentes de avaliação:', err)
    }
  }

  const renderPerfil = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <img
            src={estabelecimento?.foto || '/img/placeholder-100.png'}
            alt={estabelecimento?.nome || 'Estabelecimento'}
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-orange-500 mx-auto"
          />
          <h2 className="text-center text-xl font-bold text-orange-700">
            {estabelecimento?.nome || 'Sem nome'}
          </h2>
          <div className="text-sm text-gray-700 space-y-1 mt-3">
            <p>📞 {estabelecimento?.celular || 'Telefone não informado'}</p>
            <p>📧 {estabelecimento?.email}</p>
            <p>📍 {estabelecimento?.endereco || 'Endereço não informado'} </p>
            <p>🧾 {estabelecimento?.cnpj || 'CNPJ não informado'}</p>
          </div>

          <button
            onClick={() => nav('/estabelecimento/editarperfil')}
            className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
          >
            ✏️ Editar Perfil
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <h3 className="text-lg font-bold text-orange-700 mb-2">Minha Agenda</h3>
          <Calendar
            tileContent={({ date }) => {
              const dia = date.toISOString().split('T')[0]
              if (agendaPerfil[dia]) {
                return (
                  <div className="text-xs text-orange-700 font-bold mt-1">
                    📌 {agendaPerfil[dia].nota || 'Ocupado'}
                  </div>
                )
              }
              return null
            }}
          />
          <p className="text-xs text-gray-500 mt-2">
            Clique em uma data na aba "Agendas" para adicionar ou remover compromissos.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <h3 className="font-bold text-orange-700 mb-2">Freelas a Avaliar</h3>
          {avaliacoesPendentes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum freela para avaliar no momento.</p>
          ) : (
            avaliacoesPendentes.map((chamada) => (
              <CardAvaliacaoFreela
                key={chamada.id}
                chamada={chamada}
                onAvaliado={() => carregarAvaliacoesPendentes(estabelecimento.uid)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return renderPerfil()
      case 'buscar':
        return <BuscarFreelas usuario={estabelecimento} usuariosOnline={usuariosOnline} />
      case 'agendas':
        return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'vagas':
        return <VagasEstabelecimentoCompleto estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacoesRecebidasEstabelecimento />
      case 'historico':
        return <HistoricoChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'ativas':
      case 'chamadas':
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      default:
        return null
    }
  }

  // Estados de carregamento/segurança
  if (carregando) {
    return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  }

  // Se logado mas não é estabelecimento, manda pro painel correto
  if (usuario?.uid && usuario?.tipo !== 'estabelecimento') {
    if (usuario?.tipo === 'freela') return <Navigate to="/painel/freela" replace />
    if (usuario?.tipo === 'pessoa_fisica') return <Navigate to="/painel/pf" replace />
    return <Navigate to="/" replace />
  }

  // Não logado
  if (!usuario?.uid) {
    return <Navigate to="/login" replace />
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 pb-20"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {renderConteudo()}
      <MenuInferiorEstabelecimento onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
