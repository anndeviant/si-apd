export interface ApdItem {
    id: number;
    created_at: string;
    name: string;
    satuan?: string;
    jumlah?: number;
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

export interface ApdFiles {
    id: number;
    created_at: string;
    file_url: string;
    nama_file: string;
    jenis_file: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd';
    user_id?: string;
}

export interface CreateApdFilesData {
    file_url: string;
    nama_file: string;
    jenis_file: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd';
    user_id?: string;
}

export interface UpdateApdFilesData {
    file_url?: string;
    nama_file?: string;
    jenis_file?: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd';
    user_id?: string;
}

// APD Peminjaman types
export interface ApdPeminjaman {
    id: number;
    created_at: string;
    nama_peminjam: string;
    divisi: string;
    nama_apd: string;
    tanggal_pinjam: string;
    tanggal_kembali?: string;
    status: string;
}

export interface CreateApdPeminjamanData {
    nama_peminjam: string;
    divisi: string;
    nama_apd: string;
    tanggal_pinjam: string;
    tanggal_kembali?: string;
    status: string;
}

export interface UpdateApdPeminjamanData {
    nama_peminjam?: string;
    divisi?: string;
    nama_apd?: string;
    tanggal_pinjam?: string;
    tanggal_kembali?: string;
    status?: string;
}