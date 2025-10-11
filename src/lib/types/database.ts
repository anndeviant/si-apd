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
    jenis_file: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd' | 'logo_personal' | 'kpi_konsumable';
    user_id?: string;
}

export interface CreateApdFilesData {
    file_url: string;
    nama_file: string;
    jenis_file: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd' | 'logo_personal' | 'kpi_konsumable';
    user_id?: string;
}

export interface UpdateApdFilesData {
    file_url?: string;
    nama_file?: string;
    jenis_file?: 'template_mr' | 'berita_serah_terima' | 'pengajuan_apd' | 'logo_personal' | 'kpi_konsumable';
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
}

export interface CreateApdPeminjamanData {
    nama_peminjam: string;
    divisi: string;
    nama_apd: string;
    tanggal_pinjam: string;
    tanggal_kembali?: string;
}

export interface UpdateApdPeminjamanData {
    nama_peminjam?: string;
    divisi?: string;
    nama_apd?: string;
    tanggal_pinjam?: string;
    tanggal_kembali?: string;
}

// Pengajuan APD types
export interface PengajuanApd {
    id: number;
    created_at: string;
    nama_project: string;
    nomor_project: string;
    kepala_project: string;
    progres: string;
    keterangan?: string;
    tanggal: string;
    apd_nama: string;
    jumlah: number;
    unit: string;
    harga: number;
    total: number;
}

export interface CreatePengajuanApdData {
    nama_project: string;
    nomor_project: string;
    kepala_project: string;
    progres?: string;
    keterangan?: string;
    tanggal: string;
    apd_nama: string;
    jumlah: number;
    unit?: string;
    harga: number;
    // total is excluded - calculated automatically by database
}

export interface UpdatePengajuanApdData {
    nama_project?: string;
    nomor_project?: string;
    kepala_project?: string;
    progres?: string;
    keterangan?: string;
    tanggal?: string;
    apd_nama?: string;
    jumlah?: number;
    unit?: string;
    harga?: number;
    // total is excluded - calculated automatically by database
}

// Divisi types
export interface Divisi {
    id: number;
    created_at: string;
    nama_divisi: string;
}

export interface CreateDivisiData {
    nama_divisi: string;
}

// Posisi types
export interface Posisi {
    id: number;
    created_at: string;
    nama_posisi: string;
}

export interface CreatePosisiData {
    nama_posisi: string;
}

// Pegawai types
export interface Pegawai {
    id: number;
    created_at: string;
    nama?: string;
    nip?: string;
    divisi_id?: number;
    posisi_id?: number;
    bengkel_id?: number;
    size_sepatu?: number;
    jenis_sepatu?: string;
    warna_katelpack?: string;
    size_katelpack?: string;
    warna_helm?: string;
    link_helm?: string;
    link_shoes?: string;
    link_katelpack?: string;
}

export interface PegawaiWithRelations extends Pegawai {
    divisi?: Divisi;
    posisi?: Posisi;
    bengkel?: ApdBengkel;
    apd_bengkel?: ApdBengkel;
}

export interface CreatePegawaiData {
    nama: string;
    nip: string;
    divisi_id: number;
    posisi_id: number;
    bengkel_id?: number | null;
    size_sepatu?: number | null;
    jenis_sepatu?: string | null;
    warna_katelpack?: string | null;
    size_katelpack?: string | null;
    warna_helm?: string | null;
    link_helm?: string | null;
    link_shoes?: string | null;
    link_katelpack?: string | null;
}

export interface UpdatePegawaiData {
    nama?: string;
    nip?: string;
    divisi_id?: number;
    posisi_id?: number;
    bengkel_id?: number | null;
    size_sepatu?: number | null;
    jenis_sepatu?: string | null;
    warna_katelpack?: string | null;
    size_katelpack?: string | null;
    warna_helm?: string | null;
    link_helm?: string | null;
    link_shoes?: string | null;
    link_katelpack?: string | null;
}