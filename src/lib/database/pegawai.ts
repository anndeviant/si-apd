import { supabase } from "../supabase/client";
import type {
    Pegawai,
    Divisi,
    Posisi,
    CreatePegawaiData,
    CreateDivisiData,
    CreatePosisiData,
    UpdatePegawaiData,
    PegawaiWithRelations
} from "../types/database";

// Pegawai functions
export async function fetchPegawai(filters?: {
    divisi_id?: number;
    posisi_id?: number;
    nama?: string;
}): Promise<PegawaiWithRelations[]> {
    let query = supabase
        .from('pegawai')
        .select(`
            *,
            divisi(id, nama_divisi),
            posisi(id, nama_posisi)
        `)
        .order('nama', { ascending: true });

    if (filters?.divisi_id) {
        query = query.eq('divisi_id', filters.divisi_id);
    }
    if (filters?.posisi_id) {
        query = query.eq('posisi_id', filters.posisi_id);
    }
    if (filters?.nama) {
        query = query.ilike('nama', `%${filters.nama}%`);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch pegawai: ${error.message}`);
    }

    return data || [];
}

export async function createPegawai(pegawaiData: CreatePegawaiData): Promise<Pegawai> {
    const { data, error } = await supabase
        .from('pegawai')
        .insert(pegawaiData)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create pegawai: ${error.message}`);
    }

    return data;
}

export async function updatePegawai(id: number, updateData: UpdatePegawaiData): Promise<Pegawai> {
    const { data, error } = await supabase
        .from('pegawai')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update pegawai: ${error.message}`);
    }

    return data;
}

export async function deletePegawai(id: number): Promise<void> {
    const { error } = await supabase
        .from('pegawai')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete pegawai: ${error.message}`);
    }
}

// Divisi functions
export async function fetchDivisi(): Promise<Divisi[]> {
    const { data, error } = await supabase
        .from('divisi')
        .select('*')
        .order('nama_divisi', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch divisi: ${error.message}`);
    }

    return data || [];
}

export async function createDivisi(divisiData: CreateDivisiData): Promise<Divisi> {
    const { data, error } = await supabase
        .from('divisi')
        .insert(divisiData)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create divisi: ${error.message}`);
    }

    return data;
}

// Posisi functions
export async function fetchPosisi(): Promise<Posisi[]> {
    const { data, error } = await supabase
        .from('posisi')
        .select('*')
        .order('nama_posisi', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch posisi: ${error.message}`);
    }

    return data || [];
}

export async function createPosisi(posisiData: CreatePosisiData): Promise<Posisi> {
    const { data, error } = await supabase
        .from('posisi')
        .insert(posisiData)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create posisi: ${error.message}`);
    }

    return data;
}