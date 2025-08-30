import React, { useEffect, useMemo, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import AvaliacaoContratante from '@/components/AvaliacaoContratante'
import MensagensRecebidasEstabelecimento from '@/components/MensagensRecebidasEstabelecimento'
import QRCode from 'react-qr-code'

const STATUS_LISTA = [
  'pendente', 'aceita', 'confirmada', 'checkin_freela',
  'em_andamento', 'checkout_freela', 'concluido',
  'finalizada', 'cancelada_por_falta_de_pagamento', 'rejeitada'
]

export default function ChamadasContratante({ contratante }) {
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(false)
  const [chavePix, setChavePix] = useState(null)

  useEffect(() => {
    if (!contratante?.uid) return
    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoId', '==', contratante.uid),
      where('status', 'in', ['aceita', 'pago', 'checkout_freela', 'concluido'])
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const lista = []
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() })
      })
      setChamadas(lista)
    })
    return () => unsub()
  }, [contratante?.uid])

  const confirmarCheckin = async (id) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: 'checkin_freela',
        checkinEstabelecimento: serverTimestamp(),
      })
      toast.success('✅ Check-in confirmado')
    } catch (error) {
      console.error('Erro ao confirmar check-in:', error)
    }
  }

  const confirmarCheckout = async (id) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: 'concluido',
        checkoutEstabelecimento: serverTimestamp(),
      })
      toast.success('✅ Check-out confirmado')
    } catch (error) {
      console.error('Erro ao confirmar check-out:', error)
    }
  }

  const pagarComPix = async (chamada) => {
    setLoading(true)
    try {
      const resposta = await fetch('https://southamerica-east1-freelaja-web-50254.cloudfunctions.net/gerarCobrancaPix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chamadaId: chamada.id,
          valor: chamada.valorDiaria,
          cpfEstabelecimento: contratante.cnpj || '',
          nomeEstabelecimento: contratante.nome,
        })
      })
      const resultado = await resposta.json()
      if (resultado.qrCode) {
        setChavePix(resultado.qrCode)
        await updateDoc(doc(db, 'chamadas', chamada.id), {
          status: 'pago',
          formaPagamento: 'pix',
          qrCode: resultado.qrCode,
          txid: resultado.txid,
        })
      }
    } catch (error) {
      console.error('Erro ao pagar com Pix:', error)
    } finally {
      setLoading(false)
    }
  }

  const pagarComCartao = async (chamada) => {
    try {
      const resposta = await fetch('https://southamerica-east1-freelaja-web-50254.cloudfunctions.net/confirmarPagamentoComSenha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chamadaId: chamada.id,
          valor: chamada.valorDiaria,
          contratanteId: contratante.uid,
        })
      })
      const resultado = await resposta.json()
      if (resultado.sucesso) {
        await updateDoc(doc(db, 'chamadas', chamada.id), {
          status: 'pago',
          formaPagamento: 'cartao',
        })
      }
    } catch (error) {
      console.error('Erro ao pagar com Cartão:', error)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-orange-600 mb-4">📌 Chamadas Ativas</h2>

      {chavePix && (
        <div className="bg-white p-4 border mb-4 rounded">
          <h3 className="font-semibold">🔁 Copie e cole no app do banco:</h3>
          <p className="text-sm font-mono break-all">{chavePix}</p>
          <QRCode value={chavePix} size={200} className="mt-4" />
        </div>
      )}

      {chamadas.map((chamada) => (
        <div key={chamada.id} className="bg-white p-4 border mb-4 rounded shadow">
          <h3 className="font-bold text-orange-600 mb-2">Chamada #{chamada.id.slice(-5)}</h3>
          <p><strong>Freela:</strong> {chamada.freela?.nome || '---'}</p>
          <p><strong>Status:</strong> {chamada.status}</p>
          <p><strong>Valor da diária:</strong> R$ {parseFloat(chamada.valorDiaria).toFixed(2)}</p>

          {chamada.localEstabelecimento && chamada.localEstabelecimento.latitude && (
            <div className="h-48 my-2 rounded overflow-hidden">
              <MapContainer center={[chamada.localEstabelecimento.latitude, chamada.localEstabelecimento.longitude]} zoom={17} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[chamada.localEstabelecimento.latitude, chamada.localEstabelecimento.longitude]} />
              </MapContainer>
            </div>
          )}

          {chamada.observacao && (
            <p className="mt-2 text-sm italic">📋 Observação: {chamada.observacao}</p>
          )}

          {chamada.status === 'aceita' && (
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button onClick={() => pagarComCartao(chamada)} className="bg-green-600 text-white py-2 px-4 rounded">
                Pagar com Cartão
              </button>
              <button onClick={() => pagarComPix(chamada)} className="bg-yellow-500 text-white py-2 px-4 rounded">
                Pagar com Pix
              </button>
            </div>
          )}

          {chamada.status === 'pago' && (
            <button onClick={() => confirmarCheckin(chamada.id)} className="mt-4 w-full bg-blue-600 text-white py-2 rounded">
              Confirmar Check-in
            </button>
          )}

          {chamada.status === 'checkout_freela' && (
            <button onClick={() => confirmarCheckout(chamada.id)} className="mt-4 w-full bg-red-600 text-white py-2 rounded">
              Confirmar Check-out
            </button>
          )}

          <div className="mt-4">
            <MensagensRecebidasEstabelecimento chamadaId={chamada.id} />
          </div>

          {(chamada.status === 'concluido' || chamada.status === 'finalizada') && (
            <div className="mt-4">
              <AvaliacaoContratante chamadaId={chamada.id} freelaId={chamada.freelaId} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
