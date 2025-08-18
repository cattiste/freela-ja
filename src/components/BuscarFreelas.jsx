import React, { useEffect, useMemo, useState } from 'react'
import {
  collection, query, where, addDoc, serverTimestamp, getDocs, doc, getDoc, limit
} from 'firebase/firestore'
import { db } from '@/firebase'
import useStatusRTDB from '@/hooks/useStatusRTDB' // ✅ importante

const TTL_PADRAO_MS = 120_000 // 2 minutos

// Utilidade de cálculo de distância
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toMillis(v) {
  if (!v) return null;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const parsed = Date.parse(v);
    if (!Number.isNaN(parsed)) return parsed;
    if (/^\d+$/.test(v)) return Number(v);
    return null;
  }
  if (typeof v === 'object') {
    if (typeof v.toMillis === 'function') return v.toMillis();
    if (typeof v.seconds === 'number') return v.seconds * 1000;
  }
  return null;
}

function estaOnline(status, now, ttl = TTL_PADRAO_MS) {
  if (!status) return false;
  const flag = status.state === 'online' || status.online === true;
  const ts =
    toMillis(status.lastSeen) ||
    toMillis(status.last_changed) ||
    toMillis(status.updatedAt);
  return flag && now - ts <= ttl;
}

export default function BuscarFreelas({ usuario }) {
  const usuariosOnline = useStatusRTDB() // ✅ usa aqui direto
  const now = Date.now()
  const onlineUids = useMemo(() => {
    return Object.entries(usuariosOnline)
      .filter(([_, v]) => estaOnline(v, now, TTL_PADRAO_MS))
      .map(([k]) => k)
  }, [usuariosOnline])

  useEffect(() => {
    async function carregarFreelas() {
      try {
        const snap = await getDocs(
          query(collection(db, 'usuarios'), where('tipoUsuario', '==', 'freela'), limit(60))
        );
        const lista = [];
        snap.forEach((docu) => {
          const data = docu.data();
          const id = docu.id;
          if (data) lista.push({ ...data, id });
        });
        setFreelas(lista);
      } catch (e) {
        console.error('Erro ao carregar freelas:', e);
      }
    }
    carregarFreelas();
  }, []);

  const freelasFiltrados = useMemo(() => {
    const agora = Date.now();
    return freelas
      .filter((f) => {
        const status = usuariosOnline[f.uid || f.id];
        return estaOnline(status, agora, ttlMs);
      })
      .map((f) => {
        const distanciaKm =
          f?.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null;
        return { ...f, distanciaKm };
      })
      .filter((f) =>
        !filtroFuncao ||
        f?.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
      )
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
  }, [freelas, usuariosOnline, filtroFuncao, usuario]);

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Buscar por função..."
        className="w-full mb-4 px-4 py-2 border rounded"
        value={filtroFuncao}
        onChange={(e) => setFiltroFuncao(e.target.value)}
      />

      {freelasFiltrados.length === 0 ? (
        <p className="text-white text-center">Nenhum freelancer online encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freelasFiltrados.map((f) => (
            <div
              key={f.uid || f.id}
              className="bg-white rounded-xl shadow p-4 border border-orange-200"
            >
              <h3 className="text-orange-700 font-bold text-lg text-center">{f.nome}</h3>
              <p className="text-sm text-gray-600 text-center">{f.funcao}</p>
              {f.valorDiaria && (
                <p className="text-center text-sm mt-1">💰 R$ {f.valorDiaria} / diária</p>
              )}
              {f.distanciaKm && (
                <p className="text-center text-xs text-gray-500">
                  📍 {f.distanciaKm.toFixed(1)} km de você
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
