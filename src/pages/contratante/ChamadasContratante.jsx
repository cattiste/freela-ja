import React, { useEffect, useMemo, useState } from 'react';
import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import QRCode from 'react-qr-code';

// Corrige o ícone padrão dos marcadores do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const STATUS_LISTA = [
  'pendente',
  'aceita',
  'confirmada',
  'checkin_freela',
  'em_andamento',
  'checkout_freela',
  'pago',
  'concluido'
];

export default function ChamadasContratante({ contratante }) {
  const { usuario } = useAuth();
  const estab = contratante || usuario;
  const [chamadas, setChamadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estab?.uid) return;
    setLoading(true);
    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', estab.uid),
      where('status', 'in', STATUS_LISTA)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const filtradas = docs.filter(
          (ch) =>
            ch.status !== 'rejeitada' &&
            !(ch.status === 'concluido' && ch.avaliadoPeloContratante) &&
            ch.status !== 'finalizada'
        );
        setChamadas(filtradas);
        setLoading(false);
      },
      (err) => {
        console.error('[ChamadasContratante] onSnapshot erro:', err);
        toast.error('Falha ao carregar chamadas.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [estab?.uid]);

  const chamadasOrdenadas = useMemo(() => {
    const ts = (x) => x?.toMillis?.() ?? (x?.seconds ? x.seconds * 1000 : 0);
    return [...chamadas].sort((a, b) => ts(b.criadoEm) - ts(a.criadoEm));
  }, [chamadas]);

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">
        📡 Chamadas Ativas
      </h1>

      {chamadasOrdenadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa.</p>
      ) : (
        chamadasOrdenadas.map((ch) => (
          <ChamadaContratanteItem key={ch.id} ch={ch} estab={estab} />
        ))
      )}
    </div>
  );
}

function ChamadaContratanteItem({ ch, estab }) {
  const statusEfetivo = ch.pagamento?.status === 'pago' ? 'pago' : ch.status;
  const [freelaData, setFreelaData] = useState(null);

  // 🔎 Carrega dados do freela (foto etc.)
  useEffect(() => {
    if (!ch.freelaUid) return;
    const ref = doc(db, 'usuarios', ch.freelaUid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) setFreelaData(snap.data());
    });
  }, [ch.freelaUid]);

  async function confirmarCheckin() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'em_andamento',
        checkinContratante: true,
        checkinContratanteEm: serverTimestamp(),
      });
      toast.success('📍 Check-in confirmado!');
    } catch (error) {
      console.error('Erro ao confirmar check-in:', error);
      toast.error('Falha ao confirmar check-in');
    }
  }

  async function confirmarCheckout() {
    try {
      await updateDoc(doc(db, 'chamadas', ch.id), {
        status: 'concluido',
        checkoutContratante: true,
        checkoutContratanteEm: serverTimestamp(),
      });
      toast.success('⏳ Check-out confirmado!');
    } catch (error) {
      console.error('Erro ao confirmar check-out:', error);
      toast.error('Falha ao confirmar check-out');
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 border border-orange-200 space-y-2">
      <h2 className="font-semibold text-orange-600">
        Chamada #{String(ch.id).slice(-5)}
      </h2>

      {/* Foto + Nome do Freela */}
      <div className="flex items-center gap-3">
        <img
          src={freela.foto || 'https://via.placeholder.com/80'}}
          alt={ch.freelaNome}
          className="w-16 h-16 rounded-full border"
        />
        <div>
          <p className="font-semibold text-gray-800">
            {ch.freelaNome || ch.freelaUid}
          </p>
          <p className="text-sm text-gray-600">Freelancer</p>
        </div>
      </div>

      <p>
        <strong>Status:</strong> {statusEfetivo}
      </p>
      {typeof ch.valorDiaria === 'number' && (
        <p>
          <strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}
        </p>
      )}
      {ch.observacao && <p>📝 {ch.observacao}</p>}

      {/* Código e QR de Check-in */}
      {statusEfetivo === 'pago' && ch.codigoCheckin && (
        <div className="mt-4 p-3 bg-gray-50 border rounded text-center">
          <p className="text-sm text-gray-600 mb-2">
            Mostre este código ou QR Code para o freela confirmar presença:
          </p>
          <p className="text-2xl font-bold tracking-widest text-orange-600">
            {ch.codigoCheckin}
          </p>
          <div className="flex justify-center mt-3">
            <QRCode value={String(ch.codigoCheckin)} size={120} />
          </div>
        </div>
      )}

      {/* Mapa se houver coordenadas */}
      {ch.freelaCoordenadas && estab?.coordenadas && (
        <div className="w-full h-64 my-4 rounded-xl overflow-hidden border border-orange-200">
          <MapContainer
            center={[ch.freelaCoordenadas.latitude, ch.freelaCoordenadas.longitude]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={[
                ch.freelaCoordenadas.latitude,
                ch.freelaCoordenadas.longitude,
              ]}
            >
              <Popup>Freelancer {ch.freelaNome}</Popup>
            </Marker>

            <Marker
              position={[estab.coordenadas.latitude, estab.coordenadas.longitude]}
            >
              <Popup>Você (Contratante)</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* Status e botões */}
      {statusEfetivo === 'pago' && (
        <span className="block mt-2 text-blue-600 font-semibold">
          💸 Pagamento confirmado — aguardando check-in
        </span>
      )}

      {statusEfetivo === 'aceita' &&
        ch.checkinFreela &&
        !ch.checkinContratante && (
          <button
            onClick={confirmarCheckin}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ✅ Confirmar Check-in
          </button>
        )}

      {statusEfetivo === 'em_andamento' &&
        ch.checkoutFreela &&
        !ch.checkoutContratante && (
          <button
            onClick={confirmarCheckout}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ✅ Confirmar Check-out
          </button>
        )}

      {(statusEfetivo === 'concluido' || statusEfetivo === 'finalizada') && (
        <span className="block mt-2 text-green-600 font-semibold">
          ✅ Chamada finalizada
        </span>
      )}
    </div>
  );
}
