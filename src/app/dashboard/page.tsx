"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import {
  User as UserIcon,
  FileText,
  Package,
  BarChart3,
  Info,
  Settings,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header dengan Logo */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Kiri */}
            <div className="flex-shrink-0">
              <Image
                src="/logopal.png"
                alt="Logo PAL"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            {/* Logo Kanan */}
            <div className="flex-shrink-0">
              <Image
                src="/logorekum.png"
                alt="Logo Rekum"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Title */}
        <h1 className="text-lg font-bold text-blue-900 mb-4">
          SELAMAT DATANG DI SI-APD!
        </h1>

        {/* User Identity Card */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-center space-x-3">
            {/* Person Icon */}
            <div className="flex-shrink-0">
              <div className="w-15 h-15 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            {/* User Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-700 mb-0.5">
                HSE REKUM
              </p>
              <p className="text-sm text-blue-600 font-medium mb-1">
                @{user.email?.split("@")[0] || "user"}
              </p>
              <p className="text-xs text-gray-500 italic leading-snug">
                Keselamatan Anda Prioritas Kami
              </p>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Row 1 */}
            <button className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-200 flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xs text-center font-medium text-gray-700 leading-tight">
                <div>Pengajuan</div>
                <div>APD</div>
              </div>
            </button>

            <button className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-200 flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xs text-center font-medium text-gray-700 leading-tight">
                <div>Distribusi</div>
                <div>APD</div>
              </div>
            </button>

            <button className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-200 flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-xs text-center font-medium text-gray-700 leading-tight">
                <div>Rekapitulasi</div>
                <div>APD</div>
              </div>
            </button>

            {/* Row 2 */}
            <button className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-200 flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100">
                <Info className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-center font-medium text-gray-700">
                Tentang Kami
              </span>
            </button>

            <button className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-200 flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-xs text-center font-medium text-gray-700">
                Pengaturan
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow duration-200 flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-xs text-center font-medium text-gray-700">
                Keluar
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Created by Poltekkes Kemenkes Yogyakarta 2025
          </p>
        </div>
      </div>
    </div>
  );
}
