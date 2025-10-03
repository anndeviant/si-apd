"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useDivisiItems } from "@/hooks/use-divisi-items";
import type { Divisi, CreateDivisiData } from "@/lib/types/database";

interface DivisiContextType {
  items: Divisi[];
  loading: boolean;
  error: string | null;
  addItem: (itemData: CreateDivisiData) => Promise<Divisi>;
  refreshItems: () => void;
}

const DivisiContext = createContext<DivisiContextType | undefined>(undefined);

interface DivisiProviderProps {
  children: ReactNode;
}

export function DivisiProvider({ children }: DivisiProviderProps) {
  const divisiData = useDivisiItems();

  return (
    <DivisiContext.Provider value={divisiData}>
      {children}
    </DivisiContext.Provider>
  );
}

export function useDivisi() {
  const context = useContext(DivisiContext);
  if (context === undefined) {
    throw new Error("useDivisi must be used within a DivisiProvider");
  }
  return context;
}
