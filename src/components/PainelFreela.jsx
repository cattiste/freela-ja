// PainelFreela.jsx refatorado com layout em blocos e menu inferior
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import PerfilFreela from "@/components/PerfilFreela";
import AgendaFreela from "@/components/AgendaFreela";
import MenuInferiorFreela from "@/components/MenuInferiorFreela";

const PainelFreela = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [freelaId, setFreelaId] = useState(null);

  useEffect(() => {
    if (user && user.tipo === "freela") {
      setFreelaId(user.uid);
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!freelaId) return null;

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Card + Agenda lado a lado */}
      <div className="grid md:grid-cols-2 gap-4">
        <PerfilFreela freelaId={freelaId} />
        <AgendaFreela freelaId={freelaId} />
      </div>

      {/* Menu inferior com ícones */}
      <MenuInferiorFreela />
    </div>
  );
};

export default PainelFreela;
