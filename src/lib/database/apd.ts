import { supabase } from "../supabase/client";
import type {
    ApdItem,
    ApdDaily,
    ApdBengkel,
    CreateApdItemData,
    CreateBengkelData,
    CreateApdDailyData,
    PengeluaranPekerjaData,
    ApdMonthlyWithRelations,
    CreateApdMonthlyData,
    UpdateApdMonthlyData,
    BatchRekapData
} from "../types/database";



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

// APD Monthly (Batch Rekap) functions
export async function fetchApdMonthly(filters?: {
    periode?: string;
    apd_id?: number;
}): Promise<ApdMonthlyWithRelations[]> {
    let query = supabase
        .from('apd_monthly')
        .select(`
            *,
            apd_items(id, name, satuan, jumlah)
        `)
        .order('apd_id', { ascending: true });

    if (filters?.periode) {
        query = query.eq('periode', filters.periode);
    }
    if (filters?.apd_id) {
        query = query.eq('apd_id', filters.apd_id);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch APD monthly data: ${error.message}`);
    }

    // Sinkronisasi stock_awal dengan apd_items.jumlah (real-time)
    const syncedData = (data || []).map(item => ({
        ...item,
        stock_awal: item.apd_items?.jumlah || item.stock_awal || 0,
        saldo_akhir: (item.apd_items?.jumlah || item.stock_awal || 0) + (item.realisasi || 0) - (item.distribusi || 0)
    }));

    return syncedData;
}

export async function getAvailableMonthlyPeriods(): Promise<string[]> {
    const { data, error } = await supabase
        .from('apd_monthly')
        .select('periode')
        .not('periode', 'is', null)
        .order('periode', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch available monthly periods: ${error.message}`);
    }

    // Get unique periods
    const uniquePeriods = Array.from(new Set((data || []).map(item => item.periode)));
    return uniquePeriods.filter(Boolean);
}

export async function generateBatchRekap(periode: string): Promise<BatchRekapData> {
    // Untuk matching bulan, kita perlu extract year dan month dari periode
    const periodeDate = new Date(periode);
    const year = periodeDate.getFullYear();
    const month = periodeDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12

    // Hitung bulan berikutnya untuk range query
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    // Validasi: Cek apakah ada data harian untuk periode yang dipilih (match by year and month)
    const { data: dailyCheck, error: dailyCheckError } = await supabase
        .from('apd_daily')
        .select('id, periode')
        .gte('periode', `${year}-${String(month).padStart(2, '0')}-01`)
        .lt('periode', `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`)
        .limit(5); if (dailyCheckError) {
            throw new Error(`Failed to check daily data: ${dailyCheckError.message}`);
        }

    if (!dailyCheck || dailyCheck.length === 0) {
        throw new Error(`Tidak ada data harian untuk periode yang dipilih. Harap pastikan sudah ada data distribusi APD untuk bulan tersebut.`);
    }

    // Hitung tanggal bulan sebelumnya untuk stock_awal
    const currentDate = new Date(periode);
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousPeriode = previousMonth.toISOString().split('T')[0].substring(0, 7) + '-01';

    // Query batch rekap menggunakan raw SQL untuk efisiensi
    const { data, error } = await supabase.rpc('generate_batch_rekap', {
        target_periode: periode,
        previous_periode: previousPeriode
    });

    if (error) {
        // Jika stored procedure belum ada, gunakan fallback method
        return await generateBatchRekapFallback(periode);
    }

    return data;
}

// Fallback method jika stored procedure belum tersedia
async function generateBatchRekapFallback(periode: string): Promise<BatchRekapData> {
    try {
        // Untuk matching bulan, kita perlu extract year dan month dari periode
        const periodeDate = new Date(periode);
        const year = periodeDate.getFullYear();
        const month = periodeDate.getMonth() + 1;

        // Hitung bulan berikutnya untuk range query
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;

        // Validasi: Cek apakah ada data harian untuk periode yang dipilih
        const { data: dailyCheck, error: dailyError } = await supabase
            .from('apd_daily')
            .select('id')
            .gte('periode', `${year}-${String(month).padStart(2, '0')}-01`)
            .lt('periode', `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`)
            .limit(1); if (dailyError) {
                throw new Error(`Failed to check daily data: ${dailyError.message}`);
            }

        if (!dailyCheck || dailyCheck.length === 0) {
            throw new Error(`Tidak ada data harian untuk periode yang dipilih. Harap pastikan sudah ada data distribusi APD untuk bulan tersebut.`);
        }

        // Ambil APD items yang ada di apd_daily untuk periode ini
        const { data: dailyApdIds, error: dailyApdError } = await supabase
            .from('apd_daily')
            .select('apd_id')
            .gte('periode', `${year}-${String(month).padStart(2, '0')}-01`)
            .lt('periode', `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`);

        if (dailyApdError) {
            throw new Error(`Failed to fetch daily APD IDs: ${dailyApdError.message}`);
        }

        // Ambil unique APD IDs yang ada di daily
        const uniqueApdIds = [...new Set(dailyApdIds?.map(item => item.apd_id) || [])];

        if (uniqueApdIds.length === 0) {
            throw new Error(`Tidak ada data distribusi APD untuk periode yang dipilih.`);
        }

        // Ambil detail APD items berdasarkan ID yang ada di daily
        const { data: apdItems, error: apdItemsError } = await supabase
            .from('apd_items')
            .select('*')
            .in('id', uniqueApdIds)
            .order('name', { ascending: true });

        if (apdItemsError) {
            throw new Error(`Failed to fetch APD items: ${apdItemsError.message}`);
        }

        let createdCount = 0;
        let updatedCount = 0;

        for (const item of apdItems || []) {
            // Ambil stock awal dari apd_items.jumlah (konsep baru)
            const stockAwal = item.jumlah || 0;

            // Hitung total distribusi dari apd_daily
            const { data: dailyTotal } = await supabase
                .from('apd_daily')
                .select('qty')
                .eq('apd_id', item.id)
                .gte('periode', `${year}-${String(month).padStart(2, '0')}-01`)
                .lt('periode', `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`);

            const totalDistribusi = dailyTotal?.reduce((sum, daily) => sum + (daily.qty || 0), 0) || 0;

            const realisasi = 0; // Default 0, bisa edit manual
            const saldoAkhir = stockAwal + realisasi - totalDistribusi;

            // Cek apakah sudah ada record untuk periode ini
            const { data: existingRecord } = await supabase
                .from('apd_monthly')
                .select('id')
                .eq('apd_id', item.id)
                .eq('periode', periode)
                .single();

            if (existingRecord) {
                // Update existing record
                const { error: updateError } = await supabase
                    .from('apd_monthly')
                    .update({
                        stock_awal: stockAwal,
                        distribusi: totalDistribusi,
                        saldo_akhir: saldoAkhir,
                        satuan: item.satuan
                    })
                    .eq('id', existingRecord.id);

                if (updateError) {
                    throw new Error(`Failed to update monthly record: ${updateError.message}`);
                }
                updatedCount++;
            } else {
                // Insert new record
                const monthlyData: CreateApdMonthlyData = {
                    apd_id: item.id,
                    periode,
                    stock_awal: stockAwal,
                    realisasi,
                    distribusi: totalDistribusi,
                    saldo_akhir: saldoAkhir,
                    satuan: item.satuan
                };

                const { error: insertError } = await supabase
                    .from('apd_monthly')
                    .insert(monthlyData);

                if (insertError) {
                    throw new Error(`Failed to insert monthly record: ${insertError.message}`);
                }
                createdCount++;
            }
        }

        return {
            periode,
            total_items: apdItems?.length || 0,
            created_count: createdCount,
            updated_count: updatedCount
        };
    } catch (error) {
        throw new Error(`Failed to generate batch rekap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Function untuk mendapatkan stock awal real-time dari apd_items
export async function getApdItemStockAwal(apdId: number): Promise<number> {
    const { data, error } = await supabase
        .from('apd_items')
        .select('jumlah')
        .eq('id', apdId)
        .single();

    if (error) {
        throw new Error(`Failed to fetch APD item stock: ${error.message}`);
    }

    return data?.jumlah || 0;
}

export async function updateApdMonthly(
    id: number,
    updateData: UpdateApdMonthlyData
): Promise<ApdMonthlyWithRelations> {
    console.log('updateApdMonthly called with:', { id, updateData });

    // Jika mengupdate stock_awal, realisasi atau distribusi, hitung ulang saldo_akhir
    if (updateData.stock_awal !== undefined || updateData.realisasi !== undefined || updateData.distribusi !== undefined) {
        // Ambil data current untuk mendapatkan nilai yang tidak diupdate
        const { data: currentData } = await supabase
            .from('apd_monthly')
            .select('stock_awal, realisasi, distribusi')
            .eq('id', id)
            .single();

        if (currentData) {
            const stockAwal = updateData.stock_awal !== undefined ? updateData.stock_awal : (currentData.stock_awal || 0);
            const realisasi = updateData.realisasi !== undefined ? updateData.realisasi : (currentData.realisasi || 0);
            const distribusi = updateData.distribusi !== undefined ? updateData.distribusi : (currentData.distribusi || 0);

            updateData.saldo_akhir = stockAwal + realisasi - distribusi;
        }
    }

    console.log('Final updateData to send to database:', updateData);

    const { data, error } = await supabase
        .from('apd_monthly')
        .update(updateData)
        .eq('id', id)
        .select(`
            *,
            apd_items(id, name, satuan)
        `)
        .single();

    if (error) {
        console.error('Database update error:', error);
        throw new Error(`Failed to update APD monthly data: ${error.message}`);
    }

    console.log('Database update successful:', data);
    return data;
}

// Utility function untuk mendapatkan periode bulan berikutnya
