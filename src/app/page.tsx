"use client";

import { useState } from "react";
import { ZapBotLayout } from "@/components/zapbot/zapbot-layout";
import { ZapBotDashboard } from "@/components/zapbot/dashboard";
import { ZapBotConexao } from "@/components/zapbot/conexao";
import { ZapBotChatbot } from "@/components/zapbot/chatbot-config";
import { ZapBotMensagens } from "@/components/zapbot/mensagens-log";
import { ZapBotDeploy } from "@/components/zapbot/deploy-guide";

type Pagina = "dashboard" | "conexao" | "chatbot" | "mensagens" | "deploy";

export default function ZapBotProPage() {
  const [paginaAtiva, setPaginaAtiva] = useState<Pagina>("dashboard");

  function renderPagina() {
    switch (paginaAtiva) {
      case "dashboard":
        return <ZapBotDashboard />;
      case "conexao":
        return <ZapBotConexao />;
      case "chatbot":
        return <ZapBotChatbot />;
      case "mensagens":
        return <ZapBotMensagens />;
      case "deploy":
        return <ZapBotDeploy />;
      default:
        return <ZapBotDashboard />;
    }
  }

  return (
    <ZapBotLayout paginaAtiva={paginaAtiva} setPaginaAtiva={setPaginaAtiva}>
      {renderPagina()}
    </ZapBotLayout>
  );
}