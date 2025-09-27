import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";

export default function ModalPagamentoFreela({ chamada, onClose }) {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pagamento, setPagamento] = useState(null);
  const [erro, setErro] = useState(null);

  // 🔎 Escuta em tempo real o status do pagamento
  useEffect(() => {
    if (!chamada?.id) return;

    const unsub = onSnapshot(doc(db, "chamadas", chamada.id), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.pagamento?.status === "pago") {
          toast.dismiss();
          toast.success("✅ Pagamento confirmado!");
          onClose(); // 👈 fecha modal automaticamente
        }
      }
    });

    return () => unsub();
  }, [chamada?.id, onClose]);

  // 🔄 Geração da cobrança
  useEffect(() => {
    const gerarPagamento = async () => {
      if (!chamada || !usuario || loading) return;

      try {
        setLoading(true);
        setErro(null);

        const docRef = doc(db, "usuarios", usuario.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error("Usuário não encontrado.");

        const userData = docSnap.data();
        const nomePagador = userData.nome || "Pagador";
        const docPagador = userData.cpf || userData.cnpj;
        if (!docPagador) throw new Error("CPF ou CNPJ não informado.");

        const valor = chamada.valorDiaria;
        if (!valor || valor <= 0) throw new Error("Valor da diária inválido.");

        toast.loading("Gerando cobrança Pix...");

        const response = await fetch(
          "https://us-central1-freelaja-web-50254.cloudfunctions.net/api/pix/cobrar",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chamadaId: chamada.id,
              valor: Number(valor).toFixed(2),
              nomePagador,
              docPagador: String(docPagador).replace(/\D/g, ""),
            }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || `Erro ${response.status}`);
        }

        if (!data?.copiaCola || !data?.imagemQrcode) {
          throw new Error("Dados de Pix inválidos.");
        }

        setPagamento(data);
        toast.dismiss();
        toast.success("Cobrança Pix gerada com sucesso!");
      } catch (err) {
        console.error("❌ Erro ao gerar Pix:", err);
        setErro(err.message || "Erro desconhecido.");
        toast.dismiss();
        toast.error(err.message || "Erro ao gerar cobrança Pix.");
      } finally {
        setLoading(false);
      }
    };

    gerarPagamento();
  }, [chamada, usuario]);

  if (!chamada) return null;

  const copiarCodigo = () => {
    if (pagamento?.copiaCola) {
      navigator.clipboard.writeText(pagamento.copiaCola);
      toast.success("Código Copia e Cola copiado!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center text-orange-600">
          Pagamento da Chamada
        </h2>

        {loading && <p className="text-center">⌛ Gerando Pix...</p>}

        {erro && (
          <div className="text-red-600 text-sm text-center mb-4">
            ❌ {erro}
          </div>
        )}

        {pagamento && (
          <div className="space-y-4">
            <p className="text-center text-green-700 font-semibold">
              Escaneie o QR Code ou copie o código abaixo:
            </p>

            <div className="flex justify-center">
              <QRCode value={pagamento.copiaCola} size={160} />
            </div>

            <textarea
              readOnly
              className="w-full border rounded p-2 text-sm bg-gray-100"
              value={pagamento.copiaCola}
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

            <p className="text-xs text-gray-500 text-center mt-2">
              Efetue o pagamento para liberar a chamada para o freela.
              O endereço só será liberado após a confirmação do pagamento.
            </p>
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
