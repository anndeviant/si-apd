"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/header";

export default function TentangPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
    };

    getUser();
  }, [router]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tombol Kembali */}
        <button
          onClick={handleBack}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 mb-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Kembali</span>
        </button>

        {/* Judul Halaman */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900">TENTANG KAMI</h1>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tentang SI-APD
            </h3>
            <p className="text-gray-600">
              Informasi tentang aplikasi SI-APD akan ditampilkan di sini...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
