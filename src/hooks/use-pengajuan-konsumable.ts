import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

interface FileRecord {
    id: number;
    file_url: string;
    nama_file: string;
    created_at: string;
    storage_path: string;
}

interface UsePengajuanKonsumableProps {
    userId: string;
}

export function usePengajuanKonsumable({ userId }: UsePengajuanKonsumableProps) {
    const [uploadedFiles, setUploadedFiles] = useState<FileRecord[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load existing files
    const loadExistingFiles = useCallback(async () => {
        try {
            setIsLoading(true);

            // Get all records with jenis_file 'kpi_konsumable' for this user
            const { data, error } = await supabase
                .from("apd_files")
                .select("id, file_url, nama_file, created_at")
                .eq("jenis_file", "kpi_konsumable")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error loading existing files:", error);
                toast.error("Gagal memuat file yang ada.");
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
            } else {
                setUploadedFiles([]);
            }
        } catch (error) {
            console.error("Error in loadExistingFiles:", error);
            toast.error("Terjadi kesalahan saat memuat file.");
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // Download specific file
    const downloadFile = async (file: FileRecord) => {
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

    // Upload new file
    const uploadFile = async (file: File) => {
        if (!file) return;

        // Validate file type
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

        setIsUploading(true);
        try {
            const fileName = `docs/kpi-konsumable-${userId}-${Date.now()}.${file.name
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
                    jenis_file: "kpi_konsumable",
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

    // Delete specific file
    const deleteFile = async (file: FileRecord) => {
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

    // Get files by user ID
    const getFilesByUserId = async (targetUserId: string) => {
        try {
            const { data, error } = await supabase
                .from("apd_files")
                .select("id, file_url, nama_file, created_at, user_id")
                .eq("jenis_file", "kpi_konsumable")
                .eq("user_id", targetUserId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error getting files by user ID:", error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error("Error in getFilesByUserId:", error);
            return [];
        }
    };

    // Get all files (for admin/supervisor)
    const getAllFiles = async () => {
        try {
            const { data, error } = await supabase
                .from("apd_files")
                .select("id, file_url, nama_file, created_at, user_id")
                .eq("jenis_file", "kpi_konsumable")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error getting all files:", error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error("Error in getAllFiles:", error);
            return [];
        }
    };

    // Load files on mount
    useEffect(() => {
        if (userId) {
            loadExistingFiles();
        }
    }, [userId, loadExistingFiles]);

    return {
        uploadedFiles,
        isUploading,
        deletingFileId,
        isLoading,
        uploadFile,
        downloadFile,
        deleteFile,
        loadExistingFiles,
        getFilesByUserId,
        getAllFiles,
    };
}