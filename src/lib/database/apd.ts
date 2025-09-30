import { supabase } from "../supabase/client";
import type { ApdItem, ApdDaily, ApdBengkel, CreateApdItemData, CreateBengkelData, CreateApdDailyData } from "../types/database";

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