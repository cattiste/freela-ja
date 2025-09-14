import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function ChamadasContratante({ contratante }) {
  ...
}


function ChamadaContratanteItem({ ch, estab }) {
  const statusEfetivo = ch.pagamento?.status === "pago" ? "pago" : ch.status;
  const [freelaData, setFreelaData] = useState(null);

  // 🔎 Busca dados do freela (foto, etc.)
  useEffect(() => {
    if (!ch.freelaUid) return;
    const ref = doc(db, "usuarios", ch.freelaUid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) setFreelaData(snap.data());
    });
  }, [ch.freelaUid]);

  async function confirmarCheckin() {
    try {
      await updateDoc(doc(db, "chamadas", ch.id), {
        status: "em_andamento",
        checkinContratante: true,
        checkinContratanteEm: serverTimestamp(),
      });
      toast.success("📍 Check-in confirmado!");
    } catch (error) {
      console.error("Erro ao confirmar check-in:", error);
      toast.error("Falha ao confirmar check-in");
    }
  }

  async function confirmarCheckout() {
    try {
      await updateDoc(doc(db, "chamadas", ch.id), {
        status: "concluido",
        checkoutContratante: true,
        checkoutContratanteEm: serverTimestamp(),
      });
      toast.success("⏳ Check-out confirmado!");
    } catch (error) {
      console.error("Erro ao confirmar check-out:", error);
      toast.error("Falha ao confirmar check-out");
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 border border-orange-200 space-y-2">
      <h2 className="font-semibold text-orange-600">
        Chamada #{String(ch.id).slice(-5)}
      </h2>

      {/* Foto + nome do freela */}
      <div className="flex items-center gap-3">
        <img
          src={freelaData?.fotoUrl || "https://via.placeholder.com/80"}
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
      {typeof ch.valorDiaria === "number" && (
        <p>
          <strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}
        </p>
      )}
      {ch.observacao && <p>📝 {ch.observacao}</p>}

      {/* Código de check-in */}
      {statusEfetivo === "pago" && ch.codigoCheckin && (
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
            center={[
              ch.freelaCoordenadas.latitude,
              ch.freelaCoordenadas.longitude,
            ]}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
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

      {/* Status especiais */}
      {statusEfetivo === "pago" && (
        <span className="block mt-2 text-blue-600 font-semibold">
          💸 Pagamento confirmado — aguardando check-in
        </span>
      )}

      {statusEfetivo === "aceita" &&
        ch.checkinFreela &&
        !ch.checkinContratante && (
          <button
            onClick={confirmarCheckin}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ✅ Confirmar Check-in
          </button>
        )}

      {statusEfetivo === "em_andamento" &&
        ch.checkoutFreela &&
        !ch.checkoutContratante && (
          <button
            onClick={confirmarCheckout}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ✅ Confirmar Check-out
          </button>
        )}

      {(statusEfetivo === "concluido" || statusEfetivo === "finalizada") && (
        <span className="block mt-2 text-green-600 font-semibold">
          ✅ Chamada finalizada
        </span>
      )}
    </div>
  );
}
