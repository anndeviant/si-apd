"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (data.session) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">SI-APD</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
