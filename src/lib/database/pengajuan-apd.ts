import { supabase } from "../supabase/client";
import type {
    PengajuanApd,
    CreatePengajuanApdData,
    UpdatePengajuanApdData
} from "../types/database";

// Pengajuan APD functions
export async function fetchPengajuanApd(filters?: {
    nama_project?: string;
    progres?: string;
}): Promise<PengajuanApd[]> {
    let query = supabase
        .from('pengajuan_apd')
        .select('*')
        .order('created_at', { ascending: false });

    if (filters?.nama_project) {
        query = query.ilike('nama_project', `%${filters.nama_project}%`);
    }
    if (filters?.progres) {
        query = query.ilike('progres', `%${filters.progres}%`);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch pengajuan APD: ${error.message}`);
    }

    return data || [];
}

export async function createPengajuanApd(pengajuanData: CreatePengajuanApdData): Promise<PengajuanApd> {
    // Don't include total in insert - it's calculated automatically by database
    const dataToInsert = {
        nama_project: pengajuanData.nama_project,
        nomor_project: pengajuanData.nomor_project,
        kepala_project: pengajuanData.kepala_project,
        progres: pengajuanData.progres || 'Draft',
        keterangan: pengajuanData.keterangan,
        tanggal: pengajuanData.tanggal,
        apd_nama: pengajuanData.apd_nama,
        jumlah: pengajuanData.jumlah,
        unit: pengajuanData.unit || 'pcs',
        harga: pengajuanData.harga
        // total is excluded - will be calculated by database default constraint
    };

    const { data, error } = await supabase
        .from('pengajuan_apd')
        .insert(dataToInsert)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create pengajuan APD: ${error.message}`);
    }

    return data;
}

export async function updatePengajuanApd(
    id: number,
    updateData: UpdatePengajuanApdData
): Promise<PengajuanApd> {
    // Don't include total in update - it's calculated automatically by database
    const {
        nama_project,
        nomor_project,
        kepala_project,
        progres,
        keterangan,
        tanggal,
        apd_nama,
        jumlah,
        unit,
        harga
    } = updateData;

    const dataToUpdate = {
        ...(nama_project !== undefined && { nama_project }),
        ...(nomor_project !== undefined && { nomor_project }),
        ...(kepala_project !== undefined && { kepala_project }),
        ...(progres !== undefined && { progres }),
        ...(keterangan !== undefined && { keterangan }),
        ...(tanggal !== undefined && { tanggal }),
        ...(apd_nama !== undefined && { apd_nama }),
        ...(jumlah !== undefined && { jumlah }),
        ...(unit !== undefined && { unit }),
        ...(harga !== undefined && { harga })
    };

    const { data, error } = await supabase
        .from('pengajuan_apd')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update pengajuan APD: ${error.message}`);
    }

    return data;
}

export async function deletePengajuanApd(id: number): Promise<void> {
    const { error } = await supabase
        .from('pengajuan_apd')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete pengajuan APD: ${error.message}`);
    }
}

// Utility function for formatting date
export function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Utility function to create local date for form inputs
export function createLocalDate(dateString: string): Date {
    const date = new Date(dateString + 'T00:00:00');
    return date;
}