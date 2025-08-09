import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, updateDoc, serverTimestamp,
  collection, query, where, getDocs
} from 'firebase/firestore'
import { auth, db } from '@/firebase'

import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import VagasEstabelecimentoCompleto from '@/components/VagasEstabelecimentoCompleto'
import AvaliacoesRecebidasEstabelecimento from '@/pages/estabelecimento/AvaliacoesRecebidasEstabelecimento'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'
import ChamadasEstabelecimento from '@/pages/estabelecimento/ChamadasEstabelecimento'
import useUsuariosOnlineEstab from '@/hooks/estab/useUsuariosOnlineEstab'
import CardAvaliacaoFreela from '@/components/CardAvaliacaoFreela'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

export default function PainelEstabelecimento() {
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const [agendaPerfil, setAgendaPerfil] = useState({})

  const usuariosOnline = useUsuariosOnlineEstab()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setEstabelecimento(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)

        if (snap.exists() && snap.data().tipo === 'estabelecimento') {
          const dados = snap.data()
          setEstabelecimento({ uid: usuario.uid, ...dados })
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        }
      } catch (err) {
        console.error('[Auth] Erro ao buscar dados do estabelecimento:', err)
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!estabelecimento?.uid) return
    carregarAgenda()
    carregarAvaliacoesPendentes()
  }, [estabelecimento])

  const carregarAgenda = async () => {
    const ref = collection(db, 'usuarios', estabelecimento.uid, 'agenda')
    const snap = await getDocs(ref)
    const datas = {}
    snap.docs.forEach(doc => {
      datas[doc.id] = doc.data()
    })
    setAgendaPerfil(datas)
  }

  const carregarAvaliacoesPendentes = async () => {
    try {
      const ref = collection(db, 'chamadas')
      const q = query(
        ref,
        where('estabelecimentoUid', '==', estabelecimento.uid),
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
            src={estabelecimento?.foto || 'https://placehold.co/100x100'}
            alt={estabelecimento?.nome}
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-orange-500 mx-auto"
          />
          <h2 className="text-center text-xl font-bold text-orange-700">{estabelecimento?.nome}</h2>
          <p className="text-center text-sm text-gray-600 mb-4">
            {estabelecimento?.funcao} — {estabelecimento?.especialidade}
          </p>
          <div className="text-sm text-gray-700 space-y-1">
            <p>📞 {estabelecimento?.celular || 'Telefone não informado'}</p>
            <p>📧 {estabelecimento?.email}</p>
            <p>📍 {estabelecimento?.endereco}</p>
            <p>🧾 {estabelecimento?.cnpj}</p>
          </div>

          <button
            onClick={() => window.location.href = '/estabelecimento/editarperfil'}
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
          <p className="text-xs text-gray-500 mt-2">Clique em uma data na aba "Agendas" para adicionar ou remover compromissos.</p>
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
                onAvaliado={() => carregarAvaliacoesPendentes()}
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
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'chamadas':
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      default:
        return null
    }
  }

  if (carregando) return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  if (!estabelecimento) return <div className="text-center text-red-600 mt-8">Acesso não autorizado.</div>

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
