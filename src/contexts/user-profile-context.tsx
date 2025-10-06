"use client";

import React, { createContext, useContext, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useLogoPersonal } from "@/hooks/use-logo-personal";
import type { ApdFiles } from "@/lib/types/database";

interface UserProfileContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  profilePhoto: ApdFiles | null;
  isLoadingPhoto: boolean;
  refreshProfilePhoto: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const { logoFile, isLoading, refreshLogo } = useLogoPersonal(user);

  return (
    <UserProfileContext.Provider
      value={{
        user,
        setUser,
        profilePhoto: logoFile,
        isLoadingPhoto: isLoading,
        refreshProfilePhoto: refreshLogo,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
}
