import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import PerfilFreela from "./PerfilFreela";
import AgendaFreela from "./AgendaFreela";
import MenuInferiorFreela from "@/components/MenuInferiorFreela";

const PainelFreela = () => {
  const { usuario, carregando } = useAuth();
  const navigate = useNavigate();
  const [freelaId, setFreelaId] = useState(null);

  useEffect(() => {
    if (!carregando) {
      if (usuario && usuario.tipo === "freela") {
        setFreelaId(usuario.uid);
      } else {
        navigate("/login");
      }
    }
  }, [usuario, carregando, navigate]);

  if (carregando || !freelaId) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <PerfilFreela freelaId={freelaId} />
        <AgendaFreela freelaId={freelaId} />
      </div>
      <MenuInferiorFreela />
    </div>
  );
};

export default PainelFreela;
