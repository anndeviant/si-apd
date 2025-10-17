"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a valid reset session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Check for access_token and refresh_token in URL params (from email link)
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Set the session using the tokens from URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Session error:", error);
            setIsValidSession(false);
            toast.error(
              "Link reset password tidak valid atau sudah kedaluwarsa"
            );
          } else {
            setIsValidSession(true);
          }
        } else if (session) {
          // User already has a valid session
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
          toast.error("Link reset password tidak valid atau sudah kedaluwarsa");
        }
      } catch (error) {
        console.error("Session check error:", error);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return "Password minimal 6 karakter";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password harus mengandung huruf kecil";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password harus mengandung huruf besar";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password harus mengandung angka";
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Update password error:", error);
        toast.error(`Gagal mengubah password: ${error.message}`);
        return;
      }

      toast.success("Password berhasil diubah!");

      // Sign out user after password reset for security
      await supabase.auth.signOut();

      // Redirect to login page
      router.push("/login");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Terjadi kesalahan yang tidak terduga");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (isValidSession === null) {
    return (
      <div
        className={cn("flex flex-col gap-4 px-4 py-6", className)}
        {...props}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Memverifikasi...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state for invalid session
  if (!isValidSession) {
    return (
      <div
        className={cn("flex flex-col gap-4 px-4 py-6", className)}
        {...props}
      >
        <Card>
          <CardHeader>
            <div className="text-center">
              <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Link Tidak Valid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Link reset password tidak valid atau sudah kedaluwarsa. Silakan
                minta link reset password yang baru.
              </p>
              <Link href="/login">
                <Button className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4 px-4 py-6", className)} {...props}>
      <Card>
        <CardHeader>
          {/* Header dengan Logo */}
          <div className="flex items-center justify-between mb-4">
            <Image
              src="/logopal.png"
              alt="Logo PAL"
              width={130}
              height={60}
              className="object-contain"
            />
            <Image
              src="/logorekum.png"
              alt="Logo Rekum"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>

          {/* Judul */}
          <div className="text-center">
            <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <CardTitle>Reset Password</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Masukkan password baru untuk akun Anda
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-3">
                <Label htmlFor="new-password">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Masukkan password baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Minimal 6 karakter dan 1 angka, mengandung huruf besar dan
                  kecil
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Mengubah Password..." : "Ubah Password"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-700">
          Created by Poltekkes Kemenkes Yogyakarta 2025
        </p>
      </div>
    </div>
  );
}

function ResetPasswordContent() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/background_login.png"
          alt="Reset Password Background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Optional overlay for better readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Reset Password Form Content */}
      <div className="relative z-10 w-full max-w-sm">
        <ResetPasswordForm />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="absolute inset-0 z-0">
            <Image
              src="/background_login.png"
              alt="Reset Password Background"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="relative z-10 w-full max-w-sm">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Memuat...</p>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
