import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Corrige o ícone padrão dos marcadores do Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
})

export default function ChamadasContratante({ usuario }) {
  const [chamadas, setChamadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario?.uid) return;

    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', usuario.uid),
      where('status', 'in', ['aceita','confirmada','em_andamento','concluido','pago'])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setChamadas(docs);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar chamadas:', error);
        toast.error('Erro ao carregar chamadas');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [usuario?.uid]);

  const confirmarCheckin = async (id) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: 'em_andamento',
        checkinContratante: true,
      });
      toast.success('Check-in confirmado!');
    } catch (error) {
      console.error('Erro ao confirmar check-in:', error);
      toast.error('Falha ao confirmar check-in');
    }
  };

  const confirmarCheckout = async (id) => {
    try {
      await updateDoc(doc(db, 'chamadas', id), {
        status: 'concluido',
        checkoutContratante: true,
      });
      toast.success('Check-out confirmado!');
    } catch (error) {
      console.error('Erro ao confirmar check-out:', error);
      toast.error('Falha ao confirmar check-out');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">
        📲 Minhas Chamadas
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Carregando chamadas...</p>
      ) : chamadas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma chamada ativa.</p>
      ) : (
        chamadas.map((ch) => {
          const statusEfetivo = ch.pagamento?.status === 'pago' ? 'pago' : ch.status;

          return (
            <div
              key={ch.id}
              className="bg-white rounded-xl shadow p-4 mb-4 border border-orange-200"
            >
              <h2 className="text-xl font-bold text-orange-600">{ch.freelaNome}</h2>
              <p className="text-sm text-gray-600">Função: {ch.freelaFuncao || 'N/D'}</p>
              <p className="text-sm text-gray-600">Status: {statusEfetivo}</p>

              {ch.observacao && (
                <p className="text-sm text-gray-500 italic">
                  Observação: {ch.observacao}
                </p>
              )}

              {ch.freelaCoordenadas && usuario?.coordenadas && (
                <div className="w-full h-64 my-4 rounded-xl overflow-hidden border border-orange-200">
                  <MapContainer
                    center={[
                      ch.freelaCoordenadas.latitude,
                      ch.freelaCoordenadas.longitude
                    ]}
                    zoom={15}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Marcador do freela */}
                    <Marker position={[ch.freelaCoordenadas.latitude, ch.freelaCoordenadas.longitude]}>
                      <Popup>
                        Freelancer {ch.freelaNome}
                      </Popup>
                    </Marker>

                    {/* Marcador do contratante */}
                    <Marker position={[usuario.coordenadas.latitude, usuario.coordenadas.longitude]}>
                      <Popup>
                        Você (Contratante)
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              {(statusEfetivo === 'pago') && (
                <span className="block mt-2 text-blue-600 font-semibold">
                  💸 Pagamento confirmado — aguardando check-in
                </span>
              )}

              {statusEfetivo === 'aceita' && ch.checkinFreela && !ch.checkinContratante && (
                <button
                  onClick={() => confirmarCheckin(ch.id)}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✅ Confirmar Check-in
                </button>
              )}

              {statusEfetivo === 'em_andamento' && ch.checkoutFreela && !ch.checkoutContratante && (
                <button
                  onClick={() => confirmarCheckout(ch.id)}
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
          )
        })
      )}
    </div>
  );
}
