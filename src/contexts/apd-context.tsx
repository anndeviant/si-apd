"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useApdItems } from "@/hooks/use-apd-items";
import type { ApdItem, CreateApdItemData } from "@/lib/types/database";

interface ApdContextType {
  items: ApdItem[];
  loading: boolean;
  error: string | null;
  addItem: (itemData: CreateApdItemData) => Promise<ApdItem>;
  refreshItems: () => void;
}

const ApdContext = createContext<ApdContextType | undefined>(undefined);

interface ApdProviderProps {
  children: ReactNode;
}

export function ApdProvider({ children }: ApdProviderProps) {
  const apdData = useApdItems();

  return <ApdContext.Provider value={apdData}>{children}</ApdContext.Provider>;
}

export function useApd() {
  const context = useContext(ApdContext);
  if (context === undefined) {
    throw new Error("useApd must be used within an ApdProvider");
  }
  return context;
}
