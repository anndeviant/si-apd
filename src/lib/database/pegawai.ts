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
    bengkel_id?: number;
    nama?: string;
}): Promise<PegawaiWithRelations[]> {
    // Fetch pegawai data first
    let pegawaiQuery = supabase
        .from('pegawai')
        .select('*')
        .order('nama', { ascending: true });

    if (filters?.divisi_id) {
        pegawaiQuery = pegawaiQuery.eq('divisi_id', filters.divisi_id);
    }
    if (filters?.posisi_id) {
        pegawaiQuery = pegawaiQuery.eq('posisi_id', filters.posisi_id);
    }
    if (filters?.bengkel_id) {
        pegawaiQuery = pegawaiQuery.eq('bengkel_id', filters.bengkel_id);
    }
    if (filters?.nama) {
        pegawaiQuery = pegawaiQuery.ilike('nama', `%${filters.nama}%`);
    }

    const { data: pegawaiData, error: pegawaiError } = await pegawaiQuery;

    if (pegawaiError) {
        throw new Error(`Failed to fetch pegawai: ${pegawaiError.message}`);
    }

    if (!pegawaiData || pegawaiData.length === 0) {
        return [];
    }

    // Fetch related data
    const [divisiData, posisiData, bengkelData] = await Promise.all([
        supabase.from('divisi').select('*'),
        supabase.from('posisi').select('*'),
        supabase.from('apd_bengkel').select('*')
    ]);

    if (divisiData.error) {
        throw new Error(`Failed to fetch divisi: ${divisiData.error.message}`);
    }
    if (posisiData.error) {
        throw new Error(`Failed to fetch posisi: ${posisiData.error.message}`);
    }
    if (bengkelData.error) {
        throw new Error(`Failed to fetch bengkel: ${bengkelData.error.message}`);
    }

    // Create lookup maps
    const divisiMap = new Map(divisiData.data?.map(d => [d.id, d]) || []);
    const posisiMap = new Map(posisiData.data?.map(p => [p.id, p]) || []);
    const bengkelMap = new Map(bengkelData.data?.map(b => [b.id, b]) || []);

    // Combine data
    const result: PegawaiWithRelations[] = pegawaiData.map(pegawai => ({
        ...pegawai,
        divisi: pegawai.divisi_id ? divisiMap.get(pegawai.divisi_id) : undefined,
        posisi: pegawai.posisi_id ? posisiMap.get(pegawai.posisi_id) : undefined,
        bengkel: pegawai.bengkel_id ? bengkelMap.get(pegawai.bengkel_id) : undefined,
    }));

    return result;
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