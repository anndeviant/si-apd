"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/header";
import PengajuanProject from "@/app/_components/pengajuan-project";
import PengajuanKpi from "@/app/_components/pengajuan-kpi";

export default function PengajuanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedOption, setSelectedOption] = useState("project");

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

  // Fungsi untuk render konten berdasarkan pilihan select
  const renderContent = () => {
    switch (selectedOption) {
      case "project":
        return <PengajuanProject userId={user.id} />;
      case "kpi":
        return <PengajuanKpi userId={user.id} />;
      default:
        return null;
    }
  };

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
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-blue-900">PENGAJUAN APD</h1>
        </div>

        {/* Select Component */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Jenis Pengajuan
          </label>
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih jenis pengajuan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="kpi">Pengajuan KPI - APD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Content Area */}
        <div className="space-y-4">{renderContent()}</div>
      </div>
    </div>
  );
}
