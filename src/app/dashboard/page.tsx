"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Halaman dashboard kosong. Isi nanti ya.
        </p>
        <Button onClick={handleLogout} variant="outline" className="mt-4">
          Logout
        </Button>
      </div>
    </div>
  );
}
