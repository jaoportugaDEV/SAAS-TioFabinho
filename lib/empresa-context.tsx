"use client";

import React, { createContext, useContext } from "react";
import type { Empresa } from "@/types";

export const COOKIE_EMPRESA_ID = "current_empresa_id";

interface EmpresaContextValue {
  empresa: Empresa | null;
  empresaId: string | null;
}

const EmpresaContext = createContext<EmpresaContextValue>({
  empresa: null,
  empresaId: null,
});

export function EmpresaProvider({
  children,
  initialEmpresa,
  initialEmpresaId,
}: {
  children: React.ReactNode;
  initialEmpresa: Empresa | null;
  initialEmpresaId: string | null;
}) {
  return (
    <EmpresaContext.Provider
      value={{
        empresa: initialEmpresa,
        empresaId: initialEmpresaId,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa(): EmpresaContextValue {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error("useEmpresa deve ser usado dentro de EmpresaProvider");
  }
  return context;
}
