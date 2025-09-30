# Fix: Sinkronisasi Stock Awal dengan APD Items

## Masalah yang Ditemukan

1. **Generate Rekap**: Masih mengambil stock_awal dari `saldo_akhir` bulan sebelumnya, bukan dari `apd_items.jumlah`
2. **Modal Edit**: Menampilkan stock_awal dari data `apd_monthly` yang sudah tersimpan, bukan real-time dari `apd_items.jumlah`
3. **Update Data**: Setelah edit, stock_awal tidak tersinkronisasi dengan perubahan di Stock Opname

## Perbaikan yang Telah Dilakukan

### 1. Database Layer (`/lib/database/apd.ts`)

#### Generate Rekap

```typescript
// SEBELUM: Stock awal dari saldo_akhir bulan sebelumnya
const { data: previousMonth } = await supabase
  .from("apd_monthly")
  .select("saldo_akhir")
  .eq("apd_id", item.id)
  .eq("periode", previousPeriode)
  .single();
const stockAwal = previousMonth?.saldo_akhir || 0;

// SESUDAH: Stock awal dari apd_items.jumlah
const stockAwal = item.jumlah || 0;
```

#### Fetch Data dengan Sinkronisasi Real-time

```typescript
// Ambil data apd_items.jumlah dalam query
.select(`
    *,
    apd_items(id, name, satuan, jumlah)
`)

// Sinkronisasi stock_awal dengan apd_items.jumlah
const syncedData = (data || []).map(item => ({
    ...item,
    stock_awal: item.apd_items?.jumlah || item.stock_awal || 0,
    saldo_akhir: (item.apd_items?.jumlah || 0) + (item.realisasi || 0) - (item.distribusi || 0)
}));
```

#### Fungsi Helper Baru

```typescript
// Function untuk mendapatkan stock awal real-time
export async function getApdItemStockAwal(apdId: number): Promise<number> {
  const { data, error } = await supabase
    .from("apd_items")
    .select("jumlah")
    .eq("id", apdId)
    .single();

  return data?.jumlah || 0;
}
```

### 2. Hook Layer (`/hooks/use-batch-rekap.ts`)

#### Start Edit dengan Data Real-time

```typescript
// SEBELUM: Menggunakan stock_awal dari database
stock_awal: row.stock_awal || 0,

// SESUDAH: Menggunakan jumlah real-time dari apd_items
stock_awal: row.apd_items?.jumlah || 0,
```

#### Save Edit dengan Refresh Data

```typescript
// SEBELUM: Update state lokal manual
setMonthlyData(prev => prev.map(item => ...));

// SESUDAH: Refresh dari database (otomatis tersinkronisasi)
await loadMonthlyData();
```

### 3. Component Layer (`/app/_components/batch-rekap-form.tsx`)

#### Edit Modal dengan Data Real-time

```typescript
// SEBELUM: Stock awal dari apd_monthly
stockAwal: item.stock_awal || 0,

// SESUDAH: Stock awal dari apd_items.jumlah
stockAwal: item.apd_items?.jumlah || 0,
```

### 4. Type Definitions (`/lib/types/database.ts`)

#### Update Interface ApdItem

```typescript
export interface ApdItem {
  id: number;
  created_at: string;
  name: string;
  satuan?: string;
  jumlah?: number; // Tambahan kolom jumlah
}
```

## Flow Data Baru

### 1. Stock Opname

1. User mengubah stock awal melalui Stock Opname
2. Data disimpan di `apd_items.jumlah`

### 2. Generate Rekap

1. Ambil `apd_items.jumlah` sebagai stock_awal
2. Hitung distribusi dari apd_daily
3. Set realisasi = 0 (default)
4. Hitung saldo_akhir = stock_awal + realisasi - distribusi

### 3. Tampil Data

1. Query `apd_monthly` dengan join `apd_items`
2. Override `stock_awal` dengan `apd_items.jumlah` (real-time)
3. Recalculate `saldo_akhir`

### 4. Edit Rekap

1. Modal menampilkan stock_awal dari `apd_items.jumlah` (readonly)
2. User hanya bisa edit realisasi
3. Setelah save, refresh data otomatis tersinkronisasi

## Keuntungan Konsep Baru

1. **Konsistensi Data**: Stock awal selalu sinkron dengan master data APD
2. **Real-time**: Perubahan di Stock Opname langsung terlihat di rekap
3. **Single Source of Truth**: `apd_items.jumlah` sebagai sumber tunggal stock awal
4. **User Experience**: Modal edit lebih jelas (stock awal readonly, fokus pada realisasi)

## Testing Checklist

- [x] Generate rekap menggunakan stock awal dari apd_items.jumlah
- [x] Modal edit menampilkan stock awal real-time dan readonly
- [x] Update realisasi tidak mengubah stock awal
- [x] Perubahan di Stock Opname langsung terlihat di rekap
- [x] Saldo akhir dihitung ulang dengan benar
- [x] Data tersinkronisasi setelah generate dan edit
