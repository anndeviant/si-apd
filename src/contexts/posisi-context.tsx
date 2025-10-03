"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { usePosisiItems } from "@/hooks/use-posisi-items";
import type { Posisi, CreatePosisiData } from "@/lib/types/database";

interface PosisiContextType {
  items: Posisi[];
  loading: boolean;
  error: string | null;
  addItem: (itemData: CreatePosisiData) => Promise<Posisi>;
  refreshItems: () => void;
}

const PosisiContext = createContext<PosisiContextType | undefined>(undefined);

interface PosisiProviderProps {
  children: ReactNode;
}

export function PosisiProvider({ children }: PosisiProviderProps) {
  const posisiData = usePosisiItems();

  return (
    <PosisiContext.Provider value={posisiData}>
      {children}
    </PosisiContext.Provider>
  );
}

export function usePosisi() {
  const context = useContext(PosisiContext);
  if (context === undefined) {
    throw new Error("usePosisi must be used within a PosisiProvider");
  }
  return context;
}
