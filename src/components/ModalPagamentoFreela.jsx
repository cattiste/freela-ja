import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";

export default function ModalPagamentoFreela({ chamada, onClose }) {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cobranca, setCobranca] = useState(null);
  const [erro, setErro] = useState(null);
  const [statusFinanceiro, setStatusFinanceiro] = useState(null);

  // 🔎 Escuta status financeiro em tempo real (com proteção)
  useEffect(() => {
    if (!chamada?.id) return;
    const ref = doc(db, "financeiro", chamada.id);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          console.log("📭 Documento financeiro ainda não existe:", chamada.id);
          return; // não dá erro, só espera o backend criar
        }

        const data = snap.data();
        setStatusFinanceiro(data);

        if (data.statusCobranca === "pago") {
          toast.dismiss();
          toast.success("✅ Pagamento confirmado!");
          setTimeout(() => onClose(), 1200);
        }
      },
      (err) => {
        console.error("Erro no snapshot financeiro:", err);
        toast.error("Erro ao acompanhar pagamento.");
      }
    );

    return () => unsub();
  }, [chamada?.id, onClose]);

  // 🔄 Gera cobrança Pix no Asaas
  useEffect(() => {
    const gerarCobranca = async () => {
      if (!chamada?.id || !usuario?.customerId || loading) return;
      try {
        setLoading(true);
        setErro(null);
        toast.loading("Gerando cobrança Pix...");

        const response = await fetch(
          `${import.meta.env.VITE_FUNCTIONS_BASE_URL}/pix/cobrar`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chamadaId: chamada.id,
              customerId: usuario.customerId, // ⚡ precisa estar salvo no cadastro
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Erro ao gerar cobrança");

        setCobranca(data.cobranca);
        toast.dismiss();
        toast.success("Cobrança Pix criada com sucesso!");
      } catch (err) {
        console.error("❌ Erro ao gerar Pix:", err);
        setErro(err.message || "Erro desconhecido.");
        toast.dismiss();
        toast.error(err.message || "Erro ao gerar cobrança Pix.");
      } finally {
        setLoading(false);
      }
    };

    gerarCobranca();
  }, [chamada?.id, usuario?.customerId]);

  if (!chamada) return null;

  const copiarCodigo = () => {
    if (cobranca?.identificationField) {
      navigator.clipboard.writeText(cobranca.identificationField);
      toast.success("Código Copia e Cola copiado!");
    }
  };

  const renderStatus = () => {
    if (!statusFinanceiro) return null;
    return (
      <div className="mt-4 text-center">
        <p className="text-sm">
          <span className="font-semibold">Status cobrança:</span>{" "}
          <span
            className={
              statusFinanceiro.statusCobranca === "pago"
                ? "text-green-600 font-bold"
                : statusFinanceiro.statusCobranca === "cancelado" ||
                  statusFinanceiro.statusCobranca === "expirado"
                ? "text-red-600 font-bold"
                : "text-orange-600 font-semibold"
            }
          >
            {statusFinanceiro.statusCobranca}
          </span>
        </p>
        <p className="text-sm">
          <span className="font-semibold">Status repasse:</span>{" "}
          <span
            className={
              statusFinanceiro.statusRepasse === "enviado"
                ? "text-green-600 font-bold"
                : statusFinanceiro.statusRepasse === "falhou"
                ? "text-red-600 font-bold"
                : "text-gray-600 font-semibold"
            }
          >
            {statusFinanceiro.statusRepasse}
          </span>
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center text-orange-600">
          Pagamento da Chamada
        </h2>

        {loading && <p className="text-center">⌛ Gerando Pix...</p>}

        {erro && (
          <div className="text-red-600 text-sm text-center mb-4">❌ {erro}</div>
        )}

        {cobranca && (
          <div className="space-y-4">
            <p className="text-center text-green-700 font-semibold">
              Escaneie o QR Code ou copie o código abaixo:
            </p>

            <div className="flex justify-center">
              <QRCode value={cobranca.identificationField} size={160} />
            </div>

            <textarea
              readOnly
              className="w-full border rounded p-2 text-sm bg-gray-100"
              value={cobranca.identificationField}
              rows={4}
            />

            <div className="flex justify-center">
              <button
                onClick={copiarCodigo}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm"
              >
                Copiar código
              </button>
            </div>

            {renderStatus()}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
