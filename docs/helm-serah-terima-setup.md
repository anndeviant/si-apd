# Setup Documentation untuk Fitur Serah Terima Helm

## Database Schema Update

Telah ditambahkan 3 kolom baru pada tabel `pegawai`:

- `link_helm` (text) - URL dokumentasi helm
- `link_shoes` (text) - URL dokumentasi sepatu safety
- `link_katelpack` (text) - URL dokumentasi katelpack

## Supabase Storage Setup

Pastikan bucket `apd-files` sudah diatur dengan folder structure berikut:

```
apd-files/
├── docs/          (existing)
├── helm-docs/     (new - untuk dokumentasi helm)
├── shoes-docs/    (future - untuk dokumentasi sepatu)
└── katelpack-docs/ (future - untuk dokumentasi katelpack)
```

## Policies yang Diperlukan

Untuk bucket `apd-files`, pastikan policies berikut sudah diatur:

### 1. Select Policy

```sql
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'apd-files');
```

### 2. Insert Policy

```sql
CREATE POLICY "Allow authenticated users to upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'apd-files' AND auth.role() = 'authenticated');
```

### 3. Delete Policy

```sql
CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'apd-files' AND auth.role() = 'authenticated');
```

## Files yang Dibuat/Diupdate

### 1. Database Schema

- `harianbulanan.sql` - Added link columns

### 2. Types

- `src/lib/types/database.ts` - Updated Pegawai interfaces

### 3. Hooks

- `src/hooks/use-pegawai-helm.ts` - New hook for helm data management

### 4. Components

- `src/app/_components/pegawai-helm-table.tsx` - New table component for helm data
- `src/app/_components/berita-serah-mandatory.tsx` - Updated with helm table

## Features Implemented

### Tabs Helm

- ✅ Tabel data pegawai dengan filter warna_helm tidak null/empty
- ✅ Kolom: No, Nama, NIP, Warna Helm, Dokumentasi, Aksi
- ✅ Upload gambar dokumentasi (JPG, PNG, GIF, WebP, max 5MB)
- ✅ Preview gambar dokumentasi
- ✅ Download gambar dokumentasi
- ✅ Delete dokumentasi dengan konfirmasi
- ✅ Loading states dan error handling
- ✅ Responsive design

## Upcoming Features (Future)

### Tabs Safety Shoes

- Akan menggunakan pattern yang sama dengan helm
- Filter berdasarkan `size_sepatu` tidak null
- Kolom tambahan: Ukuran Sepatu, Jenis Sepatu
- Upload ke folder `shoes-docs/`

### Tabs Katelpack

- Akan menggunakan pattern yang sama dengan helm
- Filter berdasarkan `warna_katelpack` tidak null
- Kolom tambahan: Warna Katelpack, Size Katelpack
- Upload ke folder `katelpack-docs/`

## Testing

1. Pastikan ada data pegawai dengan `warna_helm` yang sudah diisi
2. Test upload gambar dokumentasi
3. Test preview dan download
4. Test delete dokumentasi
5. Verify data tersimpan di database dan storage

## Notes

- Hook menggunakan optimistic updates untuk UX yang lebih baik
- File upload menggunakan unique naming: `helm-docs/pegawai-{id}-{timestamp}.{ext}`
- Implementasi menggunakan Supabase Storage untuk file management
- Type errors sudah diatasi dengan proper casting
