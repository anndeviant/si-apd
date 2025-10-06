import { supabase } from "../supabase/client";
import type { ApdFiles, CreateApdFilesData, UpdateApdFilesData } from "../types/database";

/**
 * Utility functions for APD files management
 */

// Get files by jenis_file and user_id
export async function getFilesByJenis(
    jenisFile: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd' | 'logo_personal',
    userId?: string
): Promise<ApdFiles[]> {
    let query = supabase
        .from('apd_files')
        .select('*')
        .eq('jenis_file', jenisFile)
        .order('created_at', { ascending: false });

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch files: ${error.message}`);
    }

    return data || [];
}

// Get single file by jenis_file and user_id (latest)
export async function getLatestFileByJenis(
    jenisFile: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd' | 'logo_personal',
    userId?: string
): Promise<ApdFiles | null> {
    let query = supabase
        .from('apd_files')
        .select('*')
        .eq('jenis_file', jenisFile)
        .order('created_at', { ascending: false })
        .limit(1);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query.maybeSingle();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to fetch file: ${error.message}`);
    }

    return data;
}

// Create new file record
export async function createFileRecord(fileData: CreateApdFilesData): Promise<ApdFiles> {
    const { data, error } = await supabase
        .from('apd_files')
        .insert(fileData)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create file record: ${error.message}`);
    }

    return data;
}

// Update file record
export async function updateFileRecord(id: number, fileData: UpdateApdFilesData): Promise<ApdFiles> {
    const { data, error } = await supabase
        .from('apd_files')
        .update(fileData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update file record: ${error.message}`);
    }

    return data;
}

// Delete file record
export async function deleteFileRecord(id: number): Promise<void> {
    const { error } = await supabase
        .from('apd_files')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete file record: ${error.message}`);
    }
}

// Verify file exists in storage and cleanup if not
export async function verifyAndCleanupFile(fileRecord: ApdFiles): Promise<boolean> {
    if (!fileRecord.file_url) return false;

    try {
        // Extract file path from public URL to get storage path
        const urlParts = fileRecord.file_url.split('/');
        const folderPath = fileRecord.jenis_file === 'logo_personal' ? 'logos' : 'docs';
        const fileName = `${folderPath}/${urlParts[urlParts.length - 1]}`;

        // Try to download file to verify it exists
        const { error } = await supabase.storage
            .from('apd-files')
            .download(fileName);

        if (error) {
            // File doesn't exist, cleanup database record
            console.log(`File not found in storage, deleting database record for ID: ${fileRecord.id}`);
            await deleteFileRecord(fileRecord.id);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error verifying file:', error);
        return false;
    }
}

// Upload file to storage
export async function uploadFileToStorage(
    file: File,
    jenisFile: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd' | 'logo_personal',
    userId: string
): Promise<{ fileName: string; publicUrl: string }> {
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();

    // Create unique filename based on jenis_file and userId
    const folderPath = jenisFile === 'logo_personal' ? 'logos' : 'docs';
    const fileName = `${folderPath}/${jenisFile}-${userId}-${timestamp}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
        .from('apd-files')
        .upload(fileName, file);

    if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('apd-files')
        .getPublicUrl(fileName);

    return { fileName, publicUrl };
}

// Delete file from storage
export async function deleteFileFromStorage(fileName: string): Promise<void> {
    const { error } = await supabase.storage
        .from('apd-files')
        .remove([fileName]);

    if (error) {
        throw new Error(`Failed to delete file from storage: ${error.message}`);
    }
}

// Download file from storage
export async function downloadFileFromStorage(fileName: string): Promise<Blob> {
    const { data, error } = await supabase.storage
        .from('apd-files')
        .download(fileName);

    if (error) {
        throw new Error(`Failed to download file: ${error.message}`);
    }

    return data;
}

// Complete file upload process (upload + create record)
export async function completeFileUpload(
    file: File,
    jenisFile: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd' | 'logo_personal',
    userId: string,
    existingFileId?: number | null
): Promise<{ fileRecord: ApdFiles; fileName: string }> {
    try {
        // Upload file to storage
        const { fileName, publicUrl } = await uploadFileToStorage(file, jenisFile, userId);

        // Create or update database record
        let fileRecord: ApdFiles;

        if (existingFileId) {
            // Update existing record
            fileRecord = await updateFileRecord(existingFileId, {
                file_url: publicUrl,
                nama_file: file.name
            });
        } else {
            // Create new record
            fileRecord = await createFileRecord({
                file_url: publicUrl,
                nama_file: file.name,
                jenis_file: jenisFile,
                user_id: userId
            });
        }

        return { fileRecord, fileName };
    } catch (error) {
        throw error;
    }
}

// Complete file deletion process (delete from storage + delete record)
export async function completeFileDeletion(
    fileRecord: ApdFiles
): Promise<void> {
    try {
        // Extract file path from URL
        const urlParts = fileRecord.file_url.split('/');
        const folderPath = fileRecord.jenis_file === 'logo_personal' ? 'logos' : 'docs';
        const fileName = `${folderPath}/${urlParts[urlParts.length - 1]}`;

        // Delete from storage first
        await deleteFileFromStorage(fileName);

        // Delete from database
        await deleteFileRecord(fileRecord.id);
    } catch (error) {
        throw error;
    }
}