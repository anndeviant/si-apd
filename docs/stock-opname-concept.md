# Konsep Stock Opname & Rekap APD

## Overview

Konsep baru untuk pengelolaan stock awal APD dengan sinkronisasi antara tabel `apd_items` dan `apd_monthly`.

## Perubahan Konsep

### 1. Tabel apd_items

- **Tambahan kolom**: `jumlah` (bigint, default 0)
- **Fungsi**: Menyimpan stock awal yang akan menjadi master data untuk generate rekap bulanan
- **Update**: Hanya bisa diubah melalui Stock Opname dengan tombol edit

### 2. Tabel apd_monthly

- **Kolom stock_awal**: Tetap ada, tapi nilainya diambil dari `apd_items.jumlah`
- **Generate process**: Saat generate rekap, stock_awal akan disinkronkan dari tabel apd_items
- **Edit modal**: Hanya field `realisasi` yang bisa diedit, stock_awal readonly

### 3. Stock Opname

- **Fungsi utama**: Interface untuk mengatur stock awal di tabel apd_items
- **Fitur edit**: Tombol edit untuk mengubah jumlah stock awal per APD item
- **Sinkronisasi**: Perubahan akan otomatis mempengaruhi generate rekap berikutnya

## Flow Process

### Generate Rekap Bulanan

1. Ambil data dari `apd_items` (termasuk kolom `jumlah`)
2. Set `apd_monthly.stock_awal` = `apd_items.jumlah`
3. Hitung saldo_akhir = stock_awal + realisasi - distribusi

### Edit Rekap Bulanan

1. Modal hanya menampilkan field yang bisa diedit: `realisasi`
2. Stock awal ditampilkan readonly (dari apd_items.jumlah)
3. Saldo akhir dihitung ulang otomatis

### Update Stock Awal

1. Hanya melalui Stock Opname
2. Edit langsung kolom `jumlah` di tabel apd_items
3. Perubahan akan berlaku untuk generate rekap selanjutnya

## Database Changes

```sql
-- Tambahan kolom di apd_items
ALTER TABLE public.apd_items
ADD COLUMN jumlah bigint DEFAULT '0'::bigint;

-- Query untuk generate rekap (konsep)
INSERT INTO apd_monthly (apd_id, periode, stock_awal, satuan)
SELECT
  ai.id,
  $1 as periode,
  ai.jumlah as stock_awal,
  ai.satuan
FROM apd_items ai;
```

## UI Components

### Stock Opname Page

- Table dengan kolom: Nama APD, Satuan, Jumlah Stock, Action (Edit)
- Modal edit untuk update jumlah stock awal
- Validasi input (harus angka positif)

### Rekap Modal (Edit)

- Field readonly: Stock Awal (dari apd_items.jumlah)
- Field editable: Realisasi
- Field calculated: Saldo Akhir (otomatis)
- Field editable: Distribusi (opsional)
