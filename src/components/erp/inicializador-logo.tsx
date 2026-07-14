"use client";

import { useEffect } from "react";
import { useERPStore } from "@/hooks/use-erp-store";

export function InicializadorLogo() {
  const inicializarLogoPadrao = useERPStore((s) => s.inicializarLogoPadrao);

  useEffect(() => {
    inicializarLogoPadrao();
  }, [inicializarLogoPadrao]);

  return null;
}