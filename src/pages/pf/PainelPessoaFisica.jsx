// src/pages/pf/PainelPessoaFisica.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

// Reuso dos mesmos componentes do estabelecimento
import BuscarFreelas from '@/pages/estabelecimento/BuscarFreelas'
import ChamadasEstabelecimento from '@/pages/estabelecimento/ChamadasEstabelecimento'

// Menu inferior específico da PF (já existente no projeto)
import MenuInferiorPF from '@/components/MenuInferiorPF'

export default function PainelPessoaFisica() {
  const { usuario, carregando } = useAuth()
  const [aba, setAba] = useState('perfil')
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    if (!usuario?.uid) return
    const ref = doc(db, 'usuarios', usuario.uid)
    const unsub = onSnapshot(ref, (snap) => {
      setPerfil({ id: snap.id, ...snap.data() })
    })
    return () => unsub()
  }, [usuario?.uid])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Carregando...
      </div>
    )
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Faça login para acessar o painel.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Cabeçalho */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Painel — Pessoa Física</h1>
          <div className="text-sm text-gray-500">
            {perfil?.nome || usuario?.email}
          </div>
        </div>
      </header>

      {/* Conteúdo por abas */}
      <main className="max-w-5xl mx-auto px-4 py-4">
        {aba === 'perfil' && (
          <section className="space-y-4">
            {/* Card Perfil */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Seu perfil</h2>
              <div className="flex items-center gap-4">
                <img
                  src={perfil?.fotoURL || 'https://placehold.co/96x96?text=PF'}
                  alt="Foto"
                  className="w-24 h-24 rounded-full object-cover border"
                />
                <div className="flex-1">
                  <div className="text-base font-medium">
                    {perfil?.nome || 'Sem nome cadastrado'}
                  </div>
                  <div className="text-sm text-gray-600">{usuario?.email}</div>
                  <div className="text-sm text-gray-600">
                    Tipo: {perfil?.tipo || 'pessoa_fisica'}
                  </div>
                </div>
              </div>
            </div>

            {/* Chamadas Ativas (REUSO 1:1 do componente do estabelecimento) */}
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Chamadas Ativas</h2>
              {/* Passamos o uid da PF como se fosse o do contratante */}
              <ChamadasEstabelecimento estabelecimento={{ uid: usuario.uid }} />
            </div>
          </section>
        )}

        {aba === 'buscar' && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Buscar Freelas</h2>
              {/* Reutiliza o mesmo componente do estabelecimento */}
              <BuscarFreelas />
            </div>
          </section>
        )}

        {aba === 'chamadas' && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Suas Chamadas</h2>
              <ChamadasEstabelecimento estabelecimento={{ uid: usuario.uid }} />
            </div>
          </section>
        )}

        {aba === 'recebimentos' && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Recebimentos</h2>
              <p className="text-sm text-gray-600">
                (Módulo mantido só para paridade visual. PF é contratante.)
              </p>
            </div>
          </section>
        )}

        {aba === 'config' && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <h2 className="text-lg font-semibold mb-3">Configurações</h2>
              <p className="text-sm text-gray-600">
                Reaproveite os mesmos campos do estabelecimento quando fizer sentido.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Menu inferior da PF controla a aba atual */}
      <MenuInferiorPF aba={aba} onChangeAba={setAba} />
    </div>
  )
}
