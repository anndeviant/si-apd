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

interface FileRecord {
  id: number;
  file_url: string;
  nama_file: string;
  created_at: string;
  storage_path: string;
}

export default function PengajuanProject({ userId }: PengajuanProjectProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing files on mount
  useEffect(() => {
    const loadExistingFiles = async () => {
      try {
        // Get all records with jenis_file 'template_mr' for this user
        const { data, error } = await supabase
          .from("apd_files")
          .select("id, file_url, nama_file, created_at")
          .eq("jenis_file", "template_mr")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading existing files:", error);
          return;
        }

        if (data && data.length > 0) {
          // Verify each file still exists in storage and cleanup if not
          const validFiles: FileRecord[] = [];

          for (const file of data) {
            const urlParts = file.file_url.split("/");
            const fileName = `docs/${urlParts[urlParts.length - 1]}`;

            const { error: storageCheckError } = await supabase.storage
              .from("apd-files")
              .download(fileName);

            if (storageCheckError) {
              // File doesn't exist in storage, clean up database
              console.log(
                `File not found in storage, deleting database record for ID: ${file.id}`
              );
              await supabase.from("apd_files").delete().eq("id", file.id);
            } else {
              // File exists, add to valid files
              validFiles.push({
                id: file.id,
                file_url: file.file_url,
                nama_file: file.nama_file,
                created_at: file.created_at,
                storage_path: fileName,
              });
            }
          }

          setUploadedFiles(validFiles);
        }
      } catch (error) {
        console.error("Error in loadExistingFiles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingFiles();
  }, [userId]);

  // Download specific file
  const handleDownloadFile = async (file: FileRecord) => {
    try {
      const { data, error } = await supabase.storage
        .from("apd-files")
        .download(file.storage_path);

      if (error) {
        console.error("Download error:", error);
        toast.error("Gagal mendownload file. Silakan coba lagi.");
        return;
      }

      // Create download link with original filename
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.nama_file;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Terjadi kesalahan saat mendownload file.");
    }
  };

  // Handle new file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `docs/mr-${userId}-${Date.now()}.${file.name
        .split(".")
        .pop()}`;

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

      // Insert new record
      const { data: insertData, error: insertError } = await supabase
        .from("apd_files")
        .insert({
          file_url: publicUrl,
          nama_file: file.name,
          jenis_file: "template_mr",
          user_id: userId,
        })
        .select("id, created_at")
        .single();

      if (insertError) {
        console.error("Database insert error:", insertError);
        toast.error("File berhasil diupload tapi gagal simpan ke database.");
        return;
      }

      // Add new file to the list
      const newFileRecord: FileRecord = {
        id: insertData.id,
        file_url: publicUrl,
        nama_file: file.name,
        created_at: insertData.created_at,
        storage_path: fileName,
      };

      setUploadedFiles((prev) => [newFileRecord, ...prev]);
      toast.success("File berhasil diupload!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Terjadi kesalahan saat mengupload file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle specific file delete
  const handleFileDelete = async (file: FileRecord) => {
    setDeletingFileId(file.id);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("apd-files")
        .remove([file.storage_path]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        toast.error("Gagal menghapus file dari storage. Silakan coba lagi.");
        return;
      }

      // Delete record from database
      const { error: dbError } = await supabase
        .from("apd_files")
        .delete()
        .eq("id", file.id);

      if (dbError) {
        console.error("Database delete error:", dbError);
        toast.error("File dihapus dari storage tapi gagal update database.");
        return;
      }

      // Remove file from the list
      setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success("File berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Terjadi kesalahan saat menghapus file.");
    } finally {
      setDeletingFileId(null);
    }
  };

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (Excel, PDF, Word files)
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "application/pdf", // .pdf
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "application/msword", // .doc
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Hanya file Excel (.xlsx, .xls), PDF (.pdf), dan Word (.docx, .doc) yang diperbolehkan."
        );
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
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <span className="text-sm text-gray-600">Memuat data...</span>
            </div>
          ) : (
            <>
              {/* Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Files Uploaded ({uploadedFiles.length})
                  </h4>
                  {uploadedFiles.map((file) => {
                    const fileDate = new Date(
                      file.created_at
                    ).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={file.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              File Template MR - {fileDate}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {file.nama_file}
                            </p>
                          </div>
                        </div>

                        {/* Desktop: side-by-side buttons, Mobile: 2-column grid */}
                        <div className="flex items-center gap-2 flex-shrink-0 sm:flex-row">
                          <div className="hidden sm:flex items-center gap-2">
                            {/* Desktop Layout */}
                            <Button
                              onClick={() => handleDownloadFile(file)}
                              variant="outline"
                              size="sm"
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            >
                              <Download className="w-4 h-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingFileId === file.id}
                                >
                                  {deletingFileId === file.id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Konfirmasi Hapus File
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus file
                                    &quot;
                                    {file.nama_file}&quot;? Tindakan ini tidak
                                    dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleFileDelete(file)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Hapus File
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>

                          {/* Mobile Layout: 2-column grid */}
                          <div className="grid grid-cols-2 gap-2 w-full sm:hidden">
                            <Button
                              onClick={() => handleDownloadFile(file)}
                              variant="outline"
                              size="sm"
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 flex items-center justify-center"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              <span className="text-xs">Download</span>
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingFileId === file.id}
                                  className="flex items-center justify-center"
                                >
                                  {deletingFileId === file.id ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      <span className="text-xs">Hapus</span>
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Konfirmasi Hapus File
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus file
                                    &quot;
                                    {file.nama_file}&quot;? Tindakan ini tidak
                                    dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleFileDelete(file)}
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
                    );
                  })}
                </div>
              )}

              {/* Add New File Button */}
              <Button
                onClick={triggerFileInput}
                disabled={isUploading}
                variant="outline"
                className="w-full bg-black text-white border-black hover:bg-gray-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span>
                  {isUploading ? "Mengupload..." : "Tambah File Template MR"}
                </span>
              </Button>
            </>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.pdf,.docx,.doc"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Information Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Informasi Penting:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • File harus berformat Excel (.xlsx, .xls), PDF (.pdf), atau Word
              (.docx, .doc)
            </li>
            <li>• Ukuran file maksimal 10MB</li>
            <li>
              • File disimpan secara aman dan dapat diakses oleh tim terkait
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
