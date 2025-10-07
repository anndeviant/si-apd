"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/header";
import Image from "next/image";

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
              <p className="text-justify">
                Aplikasi{" "}
                <strong className="text-gray-900">Sistem Informasi APD</strong>{" "}
                merupakan inovasi digital yang dikembangkan oleh mahasiswa
                magang Poltekkes Kemenkes Yogyakarta di Biro K3LH Divisi
                Rekayasa Umum PT PAL Indonesia. Aplikasi ini hadir untuk
                mendukung proses digitalisasi sistem K3LH Divisi Rekayasa Umum,
                khususnya dalam pendataan dan pengelolaan Alat Pelindung Diri
                (APD) agar lebih efisien, akurat, dan mudah diakses.
              </p>
            </div>
          </div>

          {/* Tentang Kreator */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Logo Poltekkes */}
            <div className="flex justify-center mb-4">
              <Image
                src="/logopolkesyobaru.jpeg"
                alt="Logo Poltekkes Kemenkes Yogyakarta"
                width={300}
                height={300}
                className="object-contain"
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tentang Kreator
            </h3>
            <div className="space-y-4 text-gray-600">
              <p className="text-justify">
                Sistem ini dirancang oleh mahasiswa magang Poltekkes Kemenkes
                Yogyakarta periode 2025 sebagai bagian dari proyek inovasi
                digital di Biro K3LH Divisi Rekayasa Umum PT PAL Indonesia.
              </p>
              <p className="text-justify">
                Adapun tim kreator aplikasi ini terdiri dari:
              </p>
              <ul className="list-decimal list-inside space-y-1 ml-4">
                <li>Annisa Salsabila</li>
                <li>Jasmine Nabilla Hamida</li>
                <li>Alifia Ananda Putri</li>
                <li>Merita Rizki Pradani</li>
              </ul>
              <p className="text-justify">
                Sistem ini dirancang sebagai bagian dari kegiatan magang kami.
                Diharapkan dapat memberikan manfaat dan mendorong terciptanya
                sistem kerja yang lebih efektif dan terintegrasi.
              </p>
            </div>
          </div>

          {/* Fitur Aplikasi */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fitur Aplikasi SI-APD
            </h3>
            <div className="space-y-6">
              {/* Pengajuan APD */}
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  1. PENGAJUAN APD
                </h4>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>
                    • <strong>Pengajuan Project:</strong> Form pengajuan APD
                    untuk project tertentu dengan detail kepala project,
                    progress, dan estimasi biaya
                  </li>
                  <li>
                    • <strong>Form Pengajuan KPI:</strong> Form pengajuan APD
                    untuk Key Performance Indicator dengan tracking periode
                  </li>
                  <li>
                    • <strong>Mandatory APD:</strong> Form pengelolaan data
                    pegawai dan APD wajib sesuai standar keselamatan kerja
                  </li>
                </ul>
              </div>

              {/* Distribusi APD */}
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  2. DISTRIBUSI APD
                </h4>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>
                    • <strong>Berita Acara Serah Terima APD:</strong> Pencatatan
                    formal serah terima APD antara petugas dan penerima
                  </li>
                  <li>
                    • <strong>Peminjaman APD:</strong> Sistem peminjaman APD
                    dengan tracking peminjam, tanggal pinjam, dan status
                    pengembalian
                  </li>
                  <li>
                    • <strong>Konsumable Harian:</strong> Pencatatan distribusi
                    APD konsumable yang digunakan harian per bengkel
                  </li>
                </ul>
              </div>

              {/* Rekapitulasi APD */}
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  3. REKAPITULASI APD
                </h4>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>
                    • <strong>Stock Opname:</strong> Pencatatan dan monitoring
                    stok APD real-time dengan fitur edit langsung
                  </li>
                  <li>
                    • <strong>Neraca APD:</strong> Rekapitulasi batch APD per
                    periode dengan kalkulasi stock awal, distribusi, dan sisa
                  </li>
                  <li>
                    • <strong>Pengeluaran Pekerja Harian:</strong> Laporan
                    penggunaan APD per pekerja dalam periode harian
                  </li>
                </ul>
              </div>

              {/* Pengaturan */}
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  4. PENGATURAN
                </h4>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>
                    • <strong>Photo Profile:</strong> Upload dan kelola photo
                    profile untuk dashboard personal
                  </li>
                  <li>
                    • <strong>Informasi Akun:</strong> Tampilan detail informasi
                    akun yang sedang login
                  </li>
                </ul>
              </div>

              {/* Sistem & Reporting */}
              <div>
                <h4 className="font-medium text-blue-900 mb-2">
                  5. SISTEM & REPORTING
                </h4>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>
                    • <strong>Authentication:</strong> Sistem login/logout
                    dengan session management yang aman
                  </li>
                  <li>
                    • <strong>Export Excel:</strong> Fitur export data ke format
                    Excel untuk semua modul (stock opname, rekapitulasi,
                    peminjaman, dll)
                  </li>
                  <li>
                    • <strong>Data Tables:</strong> Tampilan data dalam tabel
                    interaktif dengan fitur edit, delete, dan filter
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Created by 2025 Poltekkes Kemenkes Yogyakarta
          </p>
        </div>
      </div>
    </div>
  );
}
