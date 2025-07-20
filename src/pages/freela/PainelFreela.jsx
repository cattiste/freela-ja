// PainelFreela.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import PerfilFreela from "./PerfilFreela";
import AgendaFreela from "./AgendaFreela";
import AvaliacoesFreela from "./AvaliacoesFreela";
import HistoricoFreela from "./HistoricoFreela";
import MenuInferiorFreela from "@/components/MenuInferiorFreela";

const PainelFreela = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [freelaId, setFreelaId] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("perfil");

  useEffect(() => {
    if (usuario && usuario.tipo === "freela") {
      setFreelaId(usuario.uid);
    } else {
      navigate("/login");
    }
  }, [usuario, navigate]);

  if (!freelaId) return null;

  const renderConteudo = () => {
    switch (abaAtiva) {
      case "perfil":
        return (
          <div className="grid md:grid-cols-2 gap-4">
            <PerfilFreela freelaId={freelaId} />
            <AgendaFreela freelaId={freelaId} />
             <AvaliacoesFreela freelaId={freelaId} />
          </div>
        );
      case "avaliacoes":
        return <AvaliacoesFreela freelaId={freelaId} />;
      case "historico":
        return <HistoricoFreela freelaId={freelaId} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 pb-20"> {/* espaço inferior pro menu fixo */}
      {renderConteudo()}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <MenuInferiorFreela onSelect={setAbaAtiva} abaAtiva={abaAtiva} />
      </div>
    </div>
  );
};

export default PainelFreela;
