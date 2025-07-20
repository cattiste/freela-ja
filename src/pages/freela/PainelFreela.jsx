// src/pages/freela/PainelFreela.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import PerfilFreela from "./PerfilFreela";
import AgendaFreela from "./AgendaFreela";
import MenuInferiorFreela from "@/components/MenuInferiorFreela";

const PainelFreela = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.tipo !== "freela") {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return <p className="text-center text-gray-500 mt-10">Carregando painel...</p>;
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="grid md:grid-cols-2 gap-4">
        <PerfilFreela freelaId={user.uid} />
        <AgendaFreela freela={user} />
      </div>
      <MenuInferiorFreela />
    </div>
  );
};

export default PainelFreela;
