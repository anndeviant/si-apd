"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useBengkelItems } from "@/hooks/use-bengkel-items";
import type { ApdBengkel, CreateBengkelData } from "@/lib/types/database";

interface BengkelContextType {
  items: ApdBengkel[];
  loading: boolean;
  error: string | null;
  addItem: (itemData: CreateBengkelData) => Promise<ApdBengkel>;
  refreshItems: () => void;
}

const BengkelContext = createContext<BengkelContextType | undefined>(undefined);

interface BengkelProviderProps {
  children: ReactNode;
}

export function BengkelProvider({ children }: BengkelProviderProps) {
  const bengkelData = useBengkelItems();

  return (
    <BengkelContext.Provider value={bengkelData}>
      {children}
    </BengkelContext.Provider>
  );
}

export function useBengkel() {
  const context = useContext(BengkelContext);
  if (context === undefined) {
    throw new Error("useBengkel must be used within a BengkelProvider");
  }
  return context;
}
