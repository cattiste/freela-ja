import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";

export default function ModalPagamentoFreela({ chamada, onClose }) {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pagamento, setPagamento] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const gerarPagamento = async () => {
      if (!chamada || !usuario) return;

      try {
        setLoading(true);
        setErro(null);

        // 📥 Busca dados do pagador (usuário logado)
        const docRef = doc(db, "usuarios", usuario.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error("Usuário não encontrado no banco de dados.");
        }

        const userData = docSnap.data();
        const nomePagador = userData.nome || "Pagador";
        const docPagador = userData.cpf || userData.cnpj;

        if (!docPagador) {
          throw new Error("CPF ou CNPJ do pagador não informado.");
        }

        const valor = chamada.valorDiaria;
        if (!valor || valor <= 0) {
          throw new Error("Valor da diária inválido.");
        }

        toast.loading("Gerando cobrança Pix...");

        const response = await fetch(
          "https://api-kbaliknhja-rj.a.run.app/pix/cobrar'",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chamadaId: chamada.id,
              valor,
              nomePagador,
              docPagador,
            }),
          }
        );

        let data;
        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              `Erro ${response.status}: ${response.statusText || "Servidor"}`
          );
        }

        if (!data?.copiaCola || !data?.imagemQrcode) {
          console.error("⚠️ Resposta Pix inválida:", data);
          throw new Error("Dados de Pix não retornados corretamente.");
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

            <p className="text-xs text-gray-500 text-center mt-2">
              Para sua segurança, não armazenamos os dados do seu cartão de crédito.
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
