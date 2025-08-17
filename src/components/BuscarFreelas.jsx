// src/components/BuscarFreelas.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  limit,
} from 'firebase/firestore'
import { db } from '@/firebase'

import ProfissionalCardMini from '@/components/ProfissionalCardMini'
import ModalFreelaDetalhes from '@/components/ModalFreelaDetalhes'

// Utilitário: distância geodésica
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toMillis(v) {
  if (!v) return null
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const parsed = Date.parse(v)
    if (!Number.isNaN(parsed)) return parsed
    if (/^\d+$/.test(v)) return Number(v)
    return null
  }
  if (typeof v === 'object') {
    if (typeof v.toMillis === 'function') return v.toMillis()
    if (typeof v.seconds === 'number') return v.seconds * 1000
  }
  return null
}

function estaOnline(rec, nowMs, ttlMs = 120000) {
  if (!rec) return false
  const flag = rec.state === 'online'
  const ts = toMillis(rec.last_changed)
  if (ts == null) return flag
  return flag && nowMs - ts <= ttlMs
}

export default function BuscarFreelas({ usuario, usuariosOnline = {} }) {
  const [perfis, setPerfis] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [modalFreela, setModalFreela] = useState(null)

  useEffect(() => {
    let cancelado = false
    async function carregarPerfis() {
      try {
        setCarregando(true)
        const resultado = []
        const uidsSet = new Set()

        // Busca novo modelo
        const qNovo = query(
          collection(db, 'usuarios'),
          where('tipoUsuario', '==', 'freela'),
          limit(50)
        )
        const snapNovo = await getDocs(qNovo)
        snapNovo.forEach((docSnap) => {
          const data = docSnap.data()
          const uid = data.uid || docSnap.id
          resultado.push({ id: docSnap.id, uid, ...data })
          uidsSet.add(uid)
        })

        // Fallback para modelo legado
        const qAntigo = query(
          collection(db, 'usuarios'),
          where('tipo', '==', 'freela'),
          limit(50)
        )
        const snapAntigo = await getDocs(qAntigo)
        snapAntigo.forEach((docSnap) => {
          const data = docSnap.data()
          const uid = data.uid || docSnap.id
          if (!uidsSet.has(uid)) {
            resultado.push({ id: docSnap.id, uid, ...data })
          }
        })

        if (!cancelado) setPerfis(resultado)
      } catch (e) {
        console.error('[BuscarFreelas] erro ao carregar perfis:', e)
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregarPerfis()

    return () => {
      cancelado = true
    }
  }, [])

  const filtrados = useMemo(() => {
    return perfis
      .map((freela) => {
        const distanciaKm =
          freela?.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                freela.coordenadas.latitude,
                freela.coordenadas.longitude
              )
            : null
        return { ...freela, distanciaKm }
      })
      .filter(
        (f) =>
          !filtroFuncao ||
          f?.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
      )
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity))
  }, [perfis, filtroFuncao, usuario])

  return (
    <div className="p-4 pb-20">
      <div className="max-w-4xl mx-auto mb-4 flex flex-col sm:flex-row gap-3 sm:items-center">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {carregando ? (
        <p className="text-center text-orange-700">🔄 Carregando freelancers...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum freela encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filtrados.map((freela) => {
            const uid = freela.uid || freela.id
            const isOnline = estaOnline(usuariosOnline[uid], Date.now())

            console.log('DEBUG FREELA', uid, usuariosOnline[uid])

            return (
              <div
                key={uid}
                className="cursor-pointer"
                onClick={() => setModalFreela({ ...freela, isOnline })}
              >
                <ProfissionalCardMini
                  freela={freela}
                  usuario={usuario}
                  isOnline={isOnline}
                />
              </div>
            )
          })}
        </div>
      )}

      {modalFreela && (
        <ModalFreelaDetalhes
          freela={modalFreela}
          isOnline={modalFreela.isOnline}
          onClose={() => setModalFreela(null)}
        />
      )}
    </div>
  )
}
