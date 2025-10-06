"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
    getLatestFileByJenis,
    completeFileUpload,
    completeFileDeletion
} from "@/lib/database/files";
import type { ApdFiles } from "@/lib/types/database";

interface UseLogoPersonalReturn {
    logoFile: ApdFiles | null;
    isLoading: boolean;
    uploadLogo: (file: File) => Promise<void>;
    deleteLogo: () => Promise<void>;
    refreshLogo: () => Promise<void>;
}

export function useLogoPersonal(user: User | null): UseLogoPersonalReturn {
    const [logoFile, setLogoFile] = useState<ApdFiles | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchLogoFile = useCallback(async () => {
        if (!user?.id) return;

        setIsLoading(true);

        try {
            const file = await getLatestFileByJenis("logo_personal", user.id);

            if (file && file.file_url) {
                // Generate signed URL if the file URL exists
                try {
                    // Extract filename from URL to create storage path
                    const urlParts = file.file_url.split('/');
                    const fileName = `logos/${urlParts[urlParts.length - 1]}`;

                    // Get signed URL from Supabase
                    const { data: signedData, error: signedError } = await supabase.storage
                        .from('apd-files')
                        .createSignedUrl(fileName, 3600); // 1 hour expiry

                    if (signedData?.signedUrl && !signedError) {
                        // Update the file object with signed URL
                        setLogoFile({
                            ...file,
                            file_url: signedData.signedUrl
                        });
                    } else {
                        // If signed URL fails, try the original URL
                        setLogoFile(file);
                    }
                } catch (signError) {
                    console.error("Error creating signed URL:", signError);
                    // Fallback to original URL
                    setLogoFile(file);
                }
            } else {
                setLogoFile(file);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal memuat logo personal");
            console.error("Error fetching logo:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    const uploadLogo = async (file: File) => {
        if (!user?.id) {
            toast.error("User tidak ditemukan");
            return;
        }

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

        setIsLoading(true);

        try {
            // If there's an existing logo, we'll update it; otherwise create new
            const existingFileId = logoFile?.id || null;

            await completeFileUpload(
                file,
                "logo_personal",
                user.id,
                existingFileId
            );

            // Force refresh the logo file to get the updated URL
            await fetchLogoFile();

            toast.success("Photo profile berhasil diupload!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal mengupload logo");
            console.error("Error uploading logo:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteLogo = async () => {
        if (!logoFile) {
            toast.error("Tidak ada logo untuk dihapus");
            return;
        }

        setIsLoading(true);

        try {
            await completeFileDeletion(logoFile);
            setLogoFile(null);
            // Force refresh to ensure clean state
            await fetchLogoFile();
            toast.success("Photo profile berhasil dihapus!");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Gagal menghapus logo");
            console.error("Error deleting logo:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshLogo = async () => {
        await fetchLogoFile();
    };

    useEffect(() => {
        fetchLogoFile();
    }, [fetchLogoFile]);

    return {
        logoFile,
        isLoading,
        uploadLogo,
        deleteLogo,
        refreshLogo,
    };
}
