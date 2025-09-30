"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Download, Upload, Trash2, FileText } from "lucide-react";

interface PengajuanProjectProps {
  userId: string;
}

export default function PengajuanProject({ userId }: PengajuanProjectProps) {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileRecordId, setFileRecordId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing file record on mount
  useEffect(() => {
    const loadExistingFile = async () => {
      try {
        // Get the latest record with template_mr for this user/session
        const { data, error } = await supabase
          .from("apd_files")
          .select("id, template_mr")
          .not("template_mr", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          // PGRST116 = no rows returned
          console.error("Error loading existing file:", error);
          return;
        }

        if (data && data.template_mr) {
          // Extract file path from public URL to get storage path
          const urlParts = data.template_mr.split("/");
          const fileName = `docs/${urlParts[urlParts.length - 1]}`;

          // Verify file still exists in storage
          const { error: storageCheckError } = await supabase.storage
            .from("apd-files")
            .download(fileName);

          if (storageCheckError) {
            // File doesn't exist in storage, clean up database
            console.log("File not found in storage, cleaning database record");
            await supabase
              .from("apd_files")
              .update({ template_mr: null })
              .eq("id", data.id);
          } else {
            // File exists, set states
            setUploadedFile(fileName);
            setFileRecordId(data.id);
          }
        }
      } catch (error) {
        console.error("Error in loadExistingFile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingFile();
  }, []);

  // Download uploaded file
  const handleDownloadFile = async () => {
    if (!uploadedFile) return;

    try {
      const { data, error } = await supabase.storage
        .from("apd-files")
        .download(uploadedFile);

      if (error) {
        console.error("Download error:", error);
        toast.error("Gagal mendownload file. Silakan coba lagi.");
        return;
      }

      // Create download link with simplified filename
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, ""); // Format: HHMMSS
      const downloadName = `Template_MR_${dateStr}_${timeStr}.xlsx`;

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Terjadi kesalahan saat mendownload file.");
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `docs/mr-${userId}-${Date.now()}.${file.name
        .split(".")
        .pop()}`;

      // If uploading over existing file, delete old file from storage first
      if (uploadedFile) {
        await supabase.storage.from("apd-files").remove([uploadedFile]);
      }

      // Upload new file to storage
      const { error: uploadError } = await supabase.storage
        .from("apd-files")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Gagal mengupload file. Silakan coba lagi.");
        return;
      }

      // Get public URL for the file
      const {
        data: { publicUrl },
      } = supabase.storage.from("apd-files").getPublicUrl(fileName);

      // Update or insert database record
      if (fileRecordId) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("apd_files")
          .update({ template_mr: publicUrl })
          .eq("id", fileRecordId);

        if (updateError) {
          console.error("Database update error:", updateError);
          toast.error("File berhasil diupload tapi gagal update database.");
          return;
        }
      } else {
        // Insert new record
        const { data: insertData, error: insertError } = await supabase
          .from("apd_files")
          .insert({ template_mr: publicUrl })
          .select("id")
          .single();

        if (insertError) {
          console.error("Database insert error:", insertError);
          toast.error("File berhasil diupload tapi gagal simpan ke database.");
          return;
        }

        setFileRecordId(insertData.id);
      }

      setUploadedFile(fileName);
      toast.success("File berhasil diupload!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Terjadi kesalahan saat mengupload file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file delete
  const handleFileDelete = async () => {
    if (!uploadedFile || !fileRecordId) return;

    setIsDeleting(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("apd-files")
        .remove([uploadedFile]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        toast.error("Gagal menghapus file dari storage. Silakan coba lagi.");
        return;
      }

      // Delete from database (set template_mr to null or delete record)
      const { error: dbError } = await supabase
        .from("apd_files")
        .update({ template_mr: null })
        .eq("id", fileRecordId);

      if (dbError) {
        console.error("Database delete error:", dbError);
        toast.error("File dihapus dari storage tapi gagal update database.");
        return;
      }

      setUploadedFile(null);
      setFileRecordId(null);
      toast.success("File berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Terjadi kesalahan saat menghapus file.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (Excel files)
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Hanya file Excel (.xlsx, .xls) yang diperbolehkan.");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB.");
        return;
      }

      handleFileUpload(file);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Material Request (MR) Project</span>
        </CardTitle>
        <CardDescription>
          Pengajuan kebutuhan material untuk project dengan menggunakan template
          standar Material Request.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <span className="text-sm text-gray-600">Memuat data...</span>
            </div>
          ) : !uploadedFile ? (
            <div className="space-y-3">
              <Button
                onClick={triggerFileInput}
                disabled={isUploading}
                className="flex items-center justify-center space-x-2 w-full"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? "Mengupload..." : "Upload File MR"}</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">
                  File MR berhasil diupload
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleDownloadFile}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    variant="outline"
                    className="flex items-center justify-center space-x-2 w-full"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? "Mengupload..." : "Reupload"}</span>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={isDeleting}
                        className="flex items-center justify-center space-x-2 w-full"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{isDeleting ? "Menghapus..." : "Delete"}</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Konfirmasi Hapus File
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus file Material
                          Request yang telah diupload? Tindakan ini tidak dapat
                          dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleFileDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Hapus File
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Information Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Informasi Penting:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • File yang diupload harus berformat Excel (.xlsx atau .xls)
            </li>
            <li>• Ukuran file maksimal 10MB</li>
            <li>
              • Pastikan semua kolom telah diisi dengan lengkap sesuai template
            </li>
            <li>
              • File yang diupload akan disimpan secara aman dan dapat diakses
              oleh tim terkait
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
