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
        <div className="space-y-6">
          {/* Tentang Aplikasi */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tentang SI-APD
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong className="text-gray-900">
                  SI-APD (Sistem Informasi Alat Pelindung Diri)
                </strong>{" "}
                adalah aplikasi web yang dikembangkan khusus untuk mendukung
                manajemen APD di lingkungan Poltekkes Kemenkes Yogyakarta.
                Aplikasi ini dirancang untuk memberikan solusi terintegrasi
                dalam pengelolaan keselamatan dan kesehatan kerja.
              </p>
              <p>
                Sistem ini menerapkan prinsip{" "}
                <em>&ldquo;Keselamatan Anda Prioritas Kami&rdquo;</em> dengan
                menyediakan platform digital yang memudahkan proses pengajuan,
                distribusi, dan monitoring penggunaan APD secara real-time dan
                akurat.
              </p>
            </div>
          </div>

          {/* Tentang Instansi */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tentang Poltekkes Kemenkes Yogyakarta
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong className="text-gray-900">
                  Politeknik Kesehatan Kementerian Kesehatan Yogyakarta
                </strong>{" "}
                adalah institusi pendidikan tinggi di bidang kesehatan yang
                berkomitmen menghasilkan tenaga kesehatan profesional dan
                berkualitas. Sebagai bagian dari Kementerian Kesehatan RI,
                Poltekkes Yogyakarta menerapkan standar keselamatan kerja yang
                ketat di seluruh aktivitas pendidikan dan operasionalnya.
              </p>
              <p>
                Unit HSE (Health, Safety, and Environment) Rekum bertanggung
                jawab memastikan lingkungan kerja yang aman dan sehat bagi
                seluruh civitas akademika melalui pengelolaan APD yang
                sistematis dan terstandarisasi.
              </p>
            </div>
          </div>

          {/* Fitur Utama */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fitur Utama Aplikasi
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Pengajuan APD</h4>
                    <p className="text-sm text-gray-600">
                      Sistem pengajuan digital untuk permintaan APD dengan
                      tracking status dan approval workflow
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Distribusi APD
                    </h4>
                    <p className="text-sm text-gray-600">
                      Pengelolaan distribusi APD dengan monitoring real-time dan
                      dokumentasi penyerahan
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Rekapitulasi & Laporan
                    </h4>
                    <p className="text-sm text-gray-600">
                      Generate laporan bulanan, batch rekap, dan export data
                      dalam format Excel/PDF
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Stock Opname</h4>
                    <p className="text-sm text-gray-600">
                      Manajemen inventori APD dengan sistem stock awal dan
                      monitoring ketersediaan
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Manajemen Data
                    </h4>
                    <p className="text-sm text-gray-600">
                      Pengelolaan data pegawai, divisi, bengkel, dan posisi
                      kerja terintegrasi
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Keamanan Data</h4>
                    <p className="text-sm text-gray-600">
                      Autentikasi user dan role-based access control dengan
                      database terenkripsi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Created by © 2025 Poltekkes Kemenkes Yogyakarta
          </p>
        </div>
      </div>
    </div>
  );
}
