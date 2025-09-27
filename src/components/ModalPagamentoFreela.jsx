// src/components/ModalPagamentoFreela.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import toast from "react-hot-toast";

export default function ModalPagamentoFreela({ chamada, onClose }) {
  const { usuario } = useAuth();
  const [statusFinanceiro, setStatusFinanceiro] = useState(null);
  const [erro, setErro] = useState(null);

  // 🔎 Escuta status financeiro em tempo real
  useEffect(() => {
    if (!chamada?.id) return;
    const ref = doc(db, "financeiro", chamada.id);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          console.log("📭 Documento financeiro ainda não existe:", chamada.id);
          return;
        }

        const data = snap.data();
        setStatusFinanceiro(data);

        if (data.statusCobranca === "pago" || data.statusCobranca === "CONFIRMED") {
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

  if (!chamada) return null;

  const copiarCodigo = () => {
    if (statusFinanceiro?.identificationField) {
      navigator.clipboard.writeText(statusFinanceiro.identificationField);
      toast.success("Código Copia e Cola copiado!");
    } else {
      toast.error("Código Pix ainda não disponível.");
    }
  };

  const renderStatus = () => {
    if (!statusFinanceiro) return null;
    return (
      <div className="mt-4 text-center text-sm">
        <p>
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

        <p>
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

        {statusFinanceiro?.receiptUrl && (
          <p className="mt-2">
            <a
              href={statusFinanceiro.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              📄 Ver comprovante do repasse
            </a>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center text-orange-600">
          Pagamento da Chamada
        </h2>

        {/* 🔹 Exibe QR Code Pix vindo do Firestore */}
        {statusFinanceiro?.pixQrCode && (
          <div className="flex justify-center mb-4">
            <img
              src={`data:image/png;base64,${statusFinanceiro.pixQrCode}`}
              alt="QR Code Pix"
              className="w-40 h-40"
            />
          </div>
        )}

        {/* 🔹 Exibe código Copia e Cola */}
        {statusFinanceiro?.identificationField && (
          <>
            <textarea
              readOnly
              className="w-full border rounded p-2 text-sm bg-gray-100 mt-2"
              value={statusFinanceiro.identificationField}
              rows={4}
            />
            <div className="flex justify-center mt-2">
              <button
                onClick={copiarCodigo}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm"
              >
                Copiar código
              </button>
            </div>
          </>
        )}

        {/* 🔹 Status cobrança/repasse */}
        {renderStatus()}

        {!statusFinanceiro?.pixQrCode && (
          <p className="text-center text-gray-600 mt-4">
            ⏳ Aguardando geração do QR Code Pix...
          </p>
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
