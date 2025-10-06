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

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from("apd-files")
            .upload(fileName, file);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            return { success: false, error: "Gagal mengupload file ke storage" };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("apd-files")
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error("Error in uploadApdFile:", error);
        return { success: false, error: "Terjadi kesalahan saat mengupload file" };
    }
}

/**
 * Delete file dari Supabase Storage
 */
export async function deleteApdFile(fileUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Extract filename from URL
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts.slice(-2).join('/'); // Get last two parts (folder/filename)

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