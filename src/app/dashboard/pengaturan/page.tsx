"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { UserProfilePhoto } from "@/components/ui/user-profile-photo";
import { useLogoPersonal } from "@/hooks/use-logo-personal";

export default function PengaturanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    logoFile,
    isLoading: logoLoading,
    uploadLogo,
    deleteLogo,
  } = useLogoPersonal(user);

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

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    uploadLogo(file);
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle delete logo
  const handleDeleteLogo = () => {
    setShowDeleteDialog(true);
  };

  // Confirm delete logo
  const confirmDeleteLogo = async () => {
    try {
      setIsDeleting(true);
      await deleteLogo();
      setShowDeleteDialog(false);
    } catch {
      toast.error("Gagal menghapus photo");
    } finally {
      setIsDeleting(false);
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
          {/* Photo Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Photo Profile</CardTitle>
              <CardDescription>
                Upload dan kelola photo profile Anda untuk dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {/* Profile Photo Preview - Circular */}
                <div className="relative">
                  {logoFile?.file_url ? (
                    <UserProfilePhoto
                      key={logoFile.id} // Force re-render when logoFile changes
                      photoUrl={logoFile.file_url}
                      size="xl"
                      className="border-4 border-gray-300"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">No Photo</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col w-full max-w-xs space-y-2">
                  <Button
                    onClick={triggerFileInput}
                    disabled={logoLoading}
                    className="w-full"
                    variant="outline"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {logoLoading
                      ? "Mengupload..."
                      : logoFile
                      ? "Ganti Photo"
                      : "Upload Photo"}
                  </Button>

                  {logoFile && (
                    <Button
                      onClick={handleDeleteLogo}
                      disabled={logoLoading}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Photo
                    </Button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus photo profile ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteLogo}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-3 w-3" />
                  Hapus
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
