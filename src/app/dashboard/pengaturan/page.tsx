"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, Mail } from "lucide-react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function PengaturanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      setEmail(user.email || "");
    };

    getUser();
  }, [router]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email harus diisi");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Format email tidak valid");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/dashboard/pengaturan`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(`Link reset password telah dikirim ke email ${email}.`);
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengirim email reset password");
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-blue-900">PENGATURAN</h1>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {/* Reset Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Reset Password</span>
              </CardTitle>
              <CardDescription>
                Ubah password akun Anda dengan mengirim link reset ke email yang
                terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="masukkan email Anda"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Link reset password akan dikirim ke email ini
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Mengirim..." : "Kirim Link Reset Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* User Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>
                Detail informasi akun yang sedang login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                <div className="flex flex-col items-center justify-center py-4 border-b">
                  <span className="font-medium text-gray-700 mb-2">
                    User ID:
                  </span>
                  <span className="text-gray-900 text-sm font-mono break-all text-center">
                    {user?.id}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center py-4">
                  <span className="font-medium text-gray-700 mb-2">
                    Terakhir Login:
                  </span>
                  <span className="text-gray-900 text-center italic">
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "Tidak diketahui"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
