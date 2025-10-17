"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Mail, Settings } from "lucide-react";

interface ResetPasswordDialogProps {
  variant?: "login" | "settings";
}

export function ResetPasswordDialog({
  variant = "login",
}: ResetPasswordDialogProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      toast.error("Mohon masukkan alamat email");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Format email tidak valid");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Reset password error:", error);
        if (error.message.includes("rate_limit_exceeded")) {
          toast.error(
            "Terlalu banyak percobaan. Coba lagi dalam beberapa menit."
          );
        } else if (
          error.message.includes("not_found") ||
          error.message.includes("user_not_found")
        ) {
          toast.error("Email tidak ditemukan dalam sistem");
        } else {
          toast.error(`Gagal mengirim email reset: ${error.message}`);
        }
        return;
      }

      toast.success(
        "Email reset password telah dikirim! Silakan periksa kotak masuk email Anda."
      );
      setIsOpen(false);
      setEmail("");
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Terjadi kesalahan yang tidak terduga");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEmail("");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {variant === "settings" ? (
          <Button variant="outline" className="text-sm">
            <Settings className="h-4 w-4 mr-2" />
            Reset Password
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="w-full text-sm text-gray-600 hover:text-blue-600"
          >
            <Mail className="h-4 w-4 mr-2" />
            Lupa Password?
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {variant === "settings" ? (
              <Settings className="h-5 w-5 text-blue-600" />
            ) : (
              <Mail className="h-5 w-5 text-blue-600" />
            )}
            Reset Password
          </AlertDialogTitle>
          <AlertDialogDescription>
            {variant === "settings"
              ? "Masukkan email akun Anda untuk menerima link reset password."
              : "Masukkan email Anda dan kami akan mengirimkan link untuk mereset password."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleResetPassword();
                }
              }}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleResetPassword}
            disabled={loading || !email.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Mengirim..." : "Kirim Email Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
