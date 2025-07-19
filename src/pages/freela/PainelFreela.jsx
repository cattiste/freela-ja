// PainelFreela.jsx corrigido
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import PerfilFreela from "@/components/PerfilFreela";
import AvaliacoesFreela from "@/components/AvaliacoesFreela";
import ConfiguracoesFreela from "@/components/ConfiguracoesFreela";
import AgendaFreela from "@/components/AgendaFreela";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="p-4">
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <PerfilFreela freelaId={freelaId} />
        </TabsContent>

        <TabsContent value="agenda">
          <AgendaFreela freelaId={freelaId} />
        </TabsContent>

        <TabsContent value="config">
          <ConfiguracoesFreela freelaId={freelaId} />
        </TabsContent>

        <TabsContent value="avaliacoes">
          <AvaliacoesFreela freelaId={freelaId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PainelFreela;
