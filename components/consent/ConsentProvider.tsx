"use client";

import { readConsentCookie, writeConsentCookie, type ConsentStatus } from "@/lib/consent/consent";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

interface ConsentContextValue {
  status: ConsentStatus;
  accept: () => void;
  decline: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

/**
 * Fournit le statut de consentement à toute l'app. Tant que le statut n'est pas
 * lu depuis le cookie (1er rendu SSR), on reste sur "unknown" -> aucun pixel ne se charge.
 * C'est le comportement le plus sûr par défaut (fail-closed, pas fail-open).
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>("unknown");

  useEffect(() => {
    setStatus(readConsentCookie());
  }, []);

  const accept = useCallback(() => {
    writeConsentCookie("granted");
    setStatus("granted");
  }, []);

  const decline = useCallback(() => {
    writeConsentCookie("denied");
    setStatus("denied");
  }, []);

  return <ConsentContext.Provider value={{ status, accept, decline }}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent doit être utilisé à l'intérieur d'un <ConsentProvider>.");
  }
  return ctx;
}
