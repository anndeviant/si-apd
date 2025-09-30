export interface ApdItem {
    id: number;
    created_at: string;
    name: string;
    satuan?: string;
}

export interface ApdBengkel {
    id: number;
    created_at: string;
    name: string;
}

export interface ApdDaily {
    id: number;
    created_at: string;
    apd_id?: number;
    tanggal?: string;
    nama?: string;
    bengkel_id?: number;
    qty?: number;
    periode?: string;
}

export interface CreateApdItemData {
    name: string;
    satuan?: string;
}

export interface CreateBengkelData {
    name: string;
}

export interface CreateApdDailyData {
    apd_id: number;
    tanggal: string;
    nama: string;
    bengkel_id: number;
    qty: number;
    periode: string;
}

export interface ApdDailyWithRelations extends ApdDaily {
    apd_items?: ApdItem;
    apd_bengkel?: ApdBengkel;
}

export interface PengeluaranPekerjaData {
    id: number;
    nama: string;
    tanggal: string;
    bengkel_name: string;
    apd_name: string;
    qty: number;
    satuan: string;
    periode: string;
}

export interface ApdMonthly {
    id: number;
    created_at: string;
    apd_id?: number;
    periode?: string;
    stock_awal?: number;
    realisasi?: number;
    distribusi?: number;
    saldo_akhir?: number;
    satuan?: string;
}

export interface ApdMonthlyWithRelations extends ApdMonthly {
    apd_items?: ApdItem;
}

export interface CreateApdMonthlyData {
    apd_id: number;
    periode: string;
    stock_awal: number;
    realisasi: number;
    distribusi: number;
    saldo_akhir: number;
    satuan?: string;
}

export interface UpdateApdMonthlyData {
    stock_awal?: number;
    realisasi?: number;
    distribusi?: number;
    saldo_akhir?: number;
}

export interface BatchRekapData {
    periode: string;
    total_items: number;
    created_count: number;
    updated_count: number;
}