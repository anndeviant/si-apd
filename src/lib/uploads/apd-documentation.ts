"use client";

import { supabase } from "@/lib/supabase/client";

/**
 * Utility functions untuk validasi dan handling file uploads
 * untuk dokumentasi APD (Helm, Safety Shoes, Katelpack)
 */

export const FILE_UPLOAD_CONFIG = {
    HELM: {
        folder: "helm-docs",
        allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
        maxSize: 5 * 1024 * 1024, // 5MB
        field: "link_helm"
    },
    SHOES: {
        folder: "shoes-docs",
        allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
        maxSize: 5 * 1024 * 1024, // 5MB
        field: "link_shoes"
    },
    KATELPACK: {
        folder: "katelpack-docs",
        allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
        maxSize: 5 * 1024 * 1024, // 5MB
        field: "link_katelpack"
    }
} as const;

export type ApdType = keyof typeof FILE_UPLOAD_CONFIG;

/**
 * Validasi file sebelum upload
 */
export function validateFile(file: File, apdType: ApdType): { isValid: boolean; error?: string } {
    const config = FILE_UPLOAD_CONFIG[apdType];

    // Check file type
    if (!config.allowedTypes.includes(file.type as never)) {
        return {
            isValid: false,
            error: "Hanya file gambar (JPG, PNG, GIF, WebP) yang diperbolehkan"
        };
    }

    // Check file size
    if (file.size > config.maxSize) {
        return {
            isValid: false,
            error: "Ukuran file maksimal 5MB"
        };
    }

    return { isValid: true };
}

/**
 * Generate unique filename untuk upload
 */
export function generateFileName(apdType: ApdType, pegawaiId: number, originalName: string): string {
    const config = FILE_UPLOAD_CONFIG[apdType];
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();

    return `${config.folder}/pegawai-${pegawaiId}-${timestamp}.${fileExtension}`;
}



/**
 * Upload file ke Supabase Storage
 */
export async function uploadApdFile(
    file: File,
    apdType: ApdType,
    pegawaiId: number
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Validate file
        const validation = validateFile(file, apdType);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        // Generate filename
        const fileName = generateFileName(apdType, pegawaiId, file.name);

        // Check if file already exists and remove it
        const { data: existingFiles } = await supabase.storage
            .from("apd-files")
            .list(FILE_UPLOAD_CONFIG[apdType].folder, {
                search: `pegawai-${pegawaiId}`
            });

        if (existingFiles && existingFiles.length > 0) {
            const filesToRemove = existingFiles.map(f => `${FILE_UPLOAD_CONFIG[apdType].folder}/${f.name}`);
            await supabase.storage.from("apd-files").remove(filesToRemove);
        }

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from("apd-files")
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            return { success: false, error: `Gagal mengupload file: ${uploadError.message}` };
        }

        // Return the file path (not signed URL) for storage in database
        // We'll generate signed URLs on-demand when needed
        return { success: true, url: fileName };
    } catch (error) {
        console.error("Error in uploadApdFile:", error);
        return { success: false, error: "Terjadi kesalahan saat mengupload file" };
    }
}

/**
 * Generate signed URL from file path (on-demand)
 * This ensures URLs never expire since they're generated fresh each time
 */
export async function generateSignedUrl(filePath: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const { data: signedData, error: signedError } = await supabase.storage
            .from("apd-files")
            .createSignedUrl(filePath, 86400); // 24 hours, but we'll generate fresh ones

        if (signedError || !signedData?.signedUrl) {
            return { success: false, error: "Gagal membuat URL untuk file" };
        }

        return { success: true, url: signedData.signedUrl };
    } catch (error) {
        console.error("Error generating signed URL:", error);
        return { success: false, error: "Terjadi kesalahan saat membuat URL file" };
    }
}

/**
 * Delete file dari Supabase Storage
 */
export async function deleteApdFile(filePathOrUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
        let fileName: string;

        // Check if it's a URL or a path
        if (filePathOrUrl.startsWith('http')) {
            // Extract filename from URL
            const url = new URL(filePathOrUrl);
            const pathParts = url.pathname.split('/');
            fileName = pathParts.slice(-2).join('/'); // Get last two parts (folder/filename)
        } else {
            // It's already a path
            fileName = filePathOrUrl;
        }

        const { error } = await supabase.storage
            .from("apd-files")
            .remove([fileName]);

        if (error) {
            console.error("Delete error:", error);
            return { success: false, error: "Gagal menghapus file dari storage" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in deleteApdFile:", error);
        return { success: false, error: "Terjadi kesalahan saat menghapus file" };
    }
}

/**
 * Update link dokumentasi di database
 */
export async function updatePegawaiApdLink(
    pegawaiId: number,
    apdType: ApdType,
    fileUrl: string | null
): Promise<{ success: boolean; error?: string }> {
    try {
        const config = FILE_UPLOAD_CONFIG[apdType];
        const updateData = { [config.field]: fileUrl };

        const { error } = await supabase
            .from("pegawai")
            .update(updateData)
            .eq("id", pegawaiId);

        if (error) {
            console.error("Database update error:", error);
            return { success: false, error: "Gagal mengupdate database" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error in updatePegawaiApdLink:", error);
        return { success: false, error: "Terjadi kesalahan saat mengupdate database" };
    }
}

/**
 * Complete flow: upload file dan update database
 */
export async function uploadAndUpdateApdDocumentation(
    file: File,
    apdType: ApdType,
    pegawaiId: number
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Upload file
        const uploadResult = await uploadApdFile(file, apdType, pegawaiId);
        if (!uploadResult.success) {
            return uploadResult;
        }

        // Update database
        const updateResult = await updatePegawaiApdLink(pegawaiId, apdType, uploadResult.url!);
        if (!updateResult.success) {
            // Rollback: delete uploaded file
            await deleteApdFile(uploadResult.url!);
            return { success: false, error: updateResult.error };
        }

        return { success: true, url: uploadResult.url };
    } catch (error) {
        console.error("Error in uploadAndUpdateApdDocumentation:", error);
        return { success: false, error: "Terjadi kesalahan saat mengupload dokumentasi" };
    }
}



/**
 * Complete flow: delete file dan update database  
 */
export async function deleteAndUpdateApdDocumentation(
    currentUrl: string,
    apdType: ApdType,
    pegawaiId: number
): Promise<{ success: boolean; error?: string }> {
    try {
        // Update database first (set to null)
        const updateResult = await updatePegawaiApdLink(pegawaiId, apdType, null);
        if (!updateResult.success) {
            return updateResult;
        }

        // Delete file from storage (ignore errors here, just warn)
        const deleteResult = await deleteApdFile(currentUrl);
        if (!deleteResult.success) {
            console.warn("Warning: Failed to delete file from storage:", deleteResult.error);
        }

        return { success: true };
    } catch (error) {
        console.error("Error in deleteAndUpdateApdDocumentation:", error);
        return { success: false, error: "Terjadi kesalahan saat menghapus dokumentasi" };
    }
}