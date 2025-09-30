import { supabase } from "../supabase/client";
import type { ApdItem, ApdDaily, ApdBengkel, CreateApdItemData, CreateBengkelData, CreateApdDailyData, PengeluaranPekerjaData } from "../types/database";



// APD Items functions
export async function fetchApdItems(): Promise<ApdItem[]> {
    const { data, error } = await supabase
        .from('apd_items')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch APD items: ${error.message}`);
    }

    return data || [];
}

export async function createApdItem(itemData: CreateApdItemData): Promise<ApdItem> {
    const { data, error } = await supabase
        .from('apd_items')
        .insert(itemData)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create APD item: ${error.message}`);
    }

    return data;
}

// Bengkel functions
export async function fetchBengkelItems(): Promise<ApdBengkel[]> {
    const { data, error } = await supabase
        .from('apd_bengkel')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        throw new Error(`Failed to fetch bengkel items: ${error.message}`);
    }

    return data || [];
}

export async function createBengkelItem(bengkelData: CreateBengkelData): Promise<ApdBengkel> {
    const { data, error } = await supabase
        .from('apd_bengkel')
        .insert(bengkelData)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create bengkel item: ${error.message}`);
    }

    return data;
}

// APD Daily functions
export async function createApdDaily(dailyData: CreateApdDailyData): Promise<ApdDaily> {
    const { data, error } = await supabase
        .from('apd_daily')
        .insert(dailyData)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create APD daily entry: ${error.message}`);
    }

    return data;
}

export async function fetchApdDaily(filters?: {
    periode?: string;
    bengkel_id?: number;
    apd_id?: number;
}): Promise<ApdDaily[]> {
    let query = supabase
        .from('apd_daily')
        .select(`
      *,
      apd_items(name, satuan),
      apd_bengkel(name)
    `)
        .order('tanggal', { ascending: false });

    if (filters?.periode) {
        query = query.eq('periode', filters.periode);
    }
    if (filters?.bengkel_id) {
        query = query.eq('bengkel_id', filters.bengkel_id);
    }
    if (filters?.apd_id) {
        query = query.eq('apd_id', filters.apd_id);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch APD daily entries: ${error.message}`);
    }

    return data || [];
}

// Utility functions
export function calculatePeriode(tanggal: string): string {
    const date = new Date(tanggal);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
}

export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Pengeluaran Pekerja functions
export async function fetchPengeluaranPekerja(filters?: {
    periode?: string;
    apd_id?: number;
}): Promise<PengeluaranPekerjaData[]> {
    let query = supabase
        .from('apd_daily')
        .select(`
            id,
            nama,
            tanggal,
            qty,
            periode,
            apd_items(id, name, satuan),
            apd_bengkel(id, name)
        `)
        .order('tanggal', { ascending: true });

    if (filters?.periode) {
        query = query.eq('periode', filters.periode);
    }
    if (filters?.apd_id) {
        query = query.eq('apd_id', filters.apd_id);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch pengeluaran pekerja: ${error.message}`);
    }

    // Transform data to match PengeluaranPekerjaData interface
    const transformedData: PengeluaranPekerjaData[] = (data || []).map((item) => {
        // Safely access nested properties with proper type assertion
        const bengkelName = item.apd_bengkel && typeof item.apd_bengkel === 'object' && 'name' in item.apd_bengkel
            ? String(item.apd_bengkel.name)
            : '';
        const apdName = item.apd_items && typeof item.apd_items === 'object' && 'name' in item.apd_items
            ? String(item.apd_items.name)
            : '';
        const satuan = item.apd_items && typeof item.apd_items === 'object' && 'satuan' in item.apd_items
            ? String(item.apd_items.satuan || '')
            : '';

        return {
            id: Number(item.id),
            nama: String(item.nama || ''),
            tanggal: String(item.tanggal || ''),
            bengkel_name: bengkelName,
            apd_name: apdName,
            qty: Number(item.qty || 0),
            satuan: satuan,
            periode: String(item.periode || '')
        };
    });

    return transformedData;
}

export async function getAvailablePeriods(): Promise<string[]> {
    const { data, error } = await supabase
        .from('apd_daily')
        .select('periode')
        .not('periode', 'is', null)
        .order('periode', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch available periods: ${error.message}`);
    }

    // Get unique periods
    const uniquePeriods = Array.from(new Set((data || []).map(item => item.periode)));
    return uniquePeriods.filter(Boolean);
}

// Delete APD Daily entry
export async function deleteApdDaily(id: number): Promise<void> {
    const { error } = await supabase
        .from('apd_daily')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete APD daily entry: ${error.message}`);
    }
}