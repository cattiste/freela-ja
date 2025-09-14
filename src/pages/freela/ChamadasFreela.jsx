import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChamadasDoFreela } from "@/hooks/useChamadasStream";
import { CHAMADA_STATUS } from "@/constants/chamadaStatus";
import RespostasRapidasFreela from "@/components/RespostasRapidasFreela";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useChamadaFlags } from "@/hooks/useChamadaFlags";
import {
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "react-hot-toast";

export default function ChamadasFreela() {
  const { usuario } = useAuth();
  const { chamadas, loading } = useChamadasDoFreela(usuario?.uid, [
    CHAMADA_STATUS.PENDENTE,
    CHAMADA_STATUS.ACEITA,
    CHAMADA_STATUS.CONFIRMADA,
    CHAMADA_STATUS.CHECKIN_FREELA,
    CHAMADA_STATUS.EM_ANDAMENTO,
    CHAMADA_STATUS.CHECKOUT_FREELA,
    CHAMADA_STATUS.CONCLUIDO,
  ]);

  if (loading) return <div className="text-center mt-8">🔄 Carregando…</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">
        📲 Minhas Chamadas (Freela)
      </h1>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada no momento.</p>
      ) : (
        chamadas.map((ch) => <ChamadaItem key={ch.id} ch={ch} />)
      )}
    </div>
  );
}

function ChamadaItem({ ch }) {
  const { usuario } = useAuth();
  const [enderecoContratante, setEnderecoContratante] = useState(
    ch.endereco || null
  );
  const [statusPagamento, setStatusPagamento] = useState(null);
  const [codigoInput, setCodigoInput] = useState("");
  const [modalCheckin, setModalCheckin] = useState(false);
  const [codigoCheckin, setCodigoCheckin] = useState(null);

  const { podeVerEndereco, podeCheckoutFreela, aguardandoPix } =
    useChamadaFlags(ch.id);

  // 🔎 escuta o doc da chamada (pagamento + codigoCheckin)
  useEffect(() => {
    const ref = doc(db, "chamadas", ch.id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setStatusPagamento(data.pagamento?.status || null);
        setCodigoCheckin(data.codigoCheckin || null);
      }
    });
    return () => unsub();
  }, [ch.id]);

  const statusEfetivo = statusPagamento === "pago" ? "pago" : ch.status;
  const podeAceitar = String(statusEfetivo || "").toLowerCase() === "pendente";

  // 🔎 busca endereço do contratante
  useEffect(() => {
    async function carregarEndereco() {
      if (!enderecoContratante && ch.contratanteUid) {
        try {
          const snap = await getDoc(doc(db, "usuarios", ch.contratanteUid));
          if (snap.exists()) {
            setEnderecoContratante(snap.data().endereco || null);
          }
        } catch (e) {
          console.error("[ChamadasFreela] Erro ao buscar endereço:", e);
        }
      }
    }
    carregarEndereco();
  }, [ch.contratanteUid, enderecoContratante]);

  async function aceitarChamada() {
    const ref = doc(db, "chamadas", ch.id);
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Chamada não existe mais.");
        const atual = snap.data();
        const statusAtual = String(atual.status || "").toLowerCase();

        if (statusAtual !== "pendente") {
          throw new Error("Essa chamada já foi aceita ou não está mais disponível.");
        }

        tx.update(ref, {
          status: "aceita",
          freelaUid: usuario?.uid || atual.freelaUid || null,
          freelaNome: usuario?.nome || atual.freelaNome || null,
          aceitaEm: serverTimestamp(),
          atualizadoEm: serverTimestamp(),
        });
      });
      toast.success("✅ Chamada aceita! Aguarde o pagamento do contratante.");
    } catch (e) {
      console.error("[aceitarChamada]", e);
      toast.error(e?.message || "Não foi possível aceitar a chamada.");
    }
  }

  // 🔑 fluxo antigo adaptado para rodar dentro do modal de código
async function confirmarCheckin() {
  console.log("🔎 Código esperado:", codigoCheckin);
  console.log("🔎 Código digitado:", codigoInput);

  if (!codigoCheckin) {
    toast.error("⚠️ Nenhum código definido pelo contratante.");
    return;
  }

  if (String(codigoInput).trim() !== String(codigoCheckin).trim()) {
    toast.error("❌ Código inválido. Tente novamente.");
    return;
  }
    try {
      let endereco = null;

      if (usuario?.coordenadas) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${usuario.coordenadas.latitude}&lon=${usuario.coordenadas.longitude}`;
        const resp = await fetch(url, {
          headers: { "User-Agent": "freelaja.com.br" },
        });
        const data = await resp.json();
        endereco = data?.display_name || null;
      }

await updateDoc(doc(db, "chamadas", ch.id), {
      status: "checkin_freela", // 👈 já muda status aqui
      checkinFreela: true,
      checkinFreelaEm: serverTimestamp(),
      coordenadasCheckInFreela: usuario?.coordenadas || null,
      atualizadoEm: serverTimestamp(),
    });

    toast.success("✅ Check-in confirmado!");
    setModalCheckin(false); // fecha modal
  } catch (e) {
    console.error("❌ Erro ao salvar check-in:", e);
    toast.error("Erro ao fazer check-in.");
  }
}

  async function fazerCheckout() {
    try {
      await updateDoc(doc(db, "chamadas", ch.id), {
        checkoutFreela: true,
        checkoutFreelaEm: serverTimestamp(),
        status: "checkout_freela",
        atualizadoEm: serverTimestamp(),
      });
      toast.success("Check-out realizado!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao fazer check-out.");
    }
  }

  async function cancelarChamada() {
    try {
      await updateDoc(doc(db, "chamadas", ch.id), {
        status: "cancelada pelo freela",
        canceladaPor: "freela",
        canceladaEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
      toast.success("❌ Chamada cancelada.");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao cancelar chamada.");
    }
  }

  return (
    <div className="bg-white border rounded-xl p-4 mb-4 space-y-2 shadow">
      <h2 className="font-semibold text-orange-600">
        Chamada #{String(ch.id).slice(-5)}
      </h2>
      <p>
        <strong>Status:</strong> {statusEfetivo}
      </p>
      {typeof ch.valorDiaria === "number" && (
        <p>
          <strong>Diária:</strong> R$ {ch.valorDiaria.toFixed(2)}
        </p>
      )}
      {ch.observacao && (
        <p className="text-sm text-gray-700">📝 {ch.observacao}</p>
      )}

      {/* Endereço / mapa */}
      {podeVerEndereco && ch.coordenadasContratante ? (
        <MapContainer
          center={[
            ch.coordenadasContratante.latitude,
            ch.coordenadasContratante.longitude,
          ]}
          zoom={17}
          scrollWheelZoom={false}
          style={{ height: 200, borderRadius: 8 }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[
              ch.coordenadasContratante.latitude,
              ch.coordenadasContratante.longitude,
            ]}
          />
        </MapContainer>
      ) : aguardandoPix ? (
        <div className="text-sm p-2 rounded bg-yellow-50">
          Aguardando confirmação do pagamento…
        </div>
      ) : (
        <div className="text-sm p-2 rounded bg-gray-100">
          Endereço será liberado após confirmação de pagamento.
        </div>
      )}

      {statusEfetivo === "pago" && enderecoContratante && (
        <div className="mt-3 p-2 bg-green-100 rounded text-green-700 text-center text-sm">
          📍 Endereço: {enderecoContratante}
          <p className="text-xs mt-1">
            Procure o responsável no local e peça o código de check-in.
          </p>
        </div>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        {podeAceitar && (
          <button
            onClick={aceitarChamada}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            ✅ Aceitar chamada
          </button>
        )}

        <button
          onClick={() => setModalCheckin(true)}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={statusEfetivo !== "pago"}
        >
          📍 Fazer Check-in
        </button>

        <button
          onClick={fazerCheckout}
          className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
          disabled={!podeCheckoutFreela}
        >
          ⏳ Fazer Check-out
        </button>

        <button
          onClick={cancelarChamada}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          ❌ Cancelar
        </button>
      </div>

      {/* Modal do código */}
      {modalCheckin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-center text-orange-600">
              Validar Check-in
            </h2>
            <p className="text-sm text-gray-600 mb-2 text-center">
              Peça ao contratante o código de check-in ou escaneie o QR.
            </p>
            <input
              type="text"
              value={codigoInput}
              onChange={(e) => setCodigoInput(e.target.value)}
              placeholder="Digite o código"
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex justify-center gap-2">
              <button
                onClick={confirmarCheckin}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirmar
              </button>
              <button
                onClick={() => setModalCheckin(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <RespostasRapidasFreela chamadaId={ch.id} />

      {(statusEfetivo === "concluido" || statusEfetivo === "finalizada") && (
        <span className="text-green-600 font-bold block text-center">
          ✅ Finalizada
        </span>
      )}
    </div>
  );
}
