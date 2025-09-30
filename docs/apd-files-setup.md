# Setup Database dan Storage untuk APD Files

## Database Setup

### 1. Tabel apd_files

Pastikan tabel `apd_files` sudah dibuat dengan struktur berikut:

```sql
CREATE TABLE public.apd_files (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  template_mr text,
  berita_serah_terima text,
  pengajuan_apd text,
  CONSTRAINT apd_files_pkey PRIMARY KEY (id)
);
```

### 2. Row Level Security (RLS)

Aktifkan RLS dan buat policy sesuai kebutuhan:

```sql
-- Aktifkan RLS
ALTER TABLE public.apd_files ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (sesuaikan dengan kebutuhan authentication)
CREATE POLICY "Users can read apd_files" ON public.apd_files
FOR SELECT USING (true);

-- Policy untuk insert
CREATE POLICY "Users can insert apd_files" ON public.apd_files
FOR INSERT WITH CHECK (true);

-- Policy untuk update
CREATE POLICY "Users can update apd_files" ON public.apd_files
FOR UPDATE USING (true);
```

## Storage Setup

### 1. Bucket Creation

Buat bucket `apd-files` di Supabase Storage:

- Masuk ke Supabase Dashboard
- Pilih Storage
- Klik "New bucket"
- Nama bucket: `apd-files`
- Atur sebagai public bucket jika diperlukan

### 2. Storage Policies

Buat policy untuk storage bucket:

```sql
-- Policy untuk upload
CREATE POLICY "Users can upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'apd-files');

-- Policy untuk read files
CREATE POLICY "Users can read files" ON storage.objects
FOR SELECT USING (bucket_id = 'apd-files');

-- Policy untuk delete files
CREATE POLICY "Users can delete files" ON storage.objects
FOR DELETE USING (bucket_id = 'apd-files');

-- Policy untuk update files
CREATE POLICY "Users can update files" ON storage.objects
FOR UPDATE USING (bucket_id = 'apd-files');
```

### 3. Folder Structure

Files akan disimpan dengan struktur:

```
apd-files/
└── docs/
    ├── mr-{userId}-{timestamp}.xlsx
    ├── mr-{userId}-{timestamp}.xls
    └── ...
```

## Cara Kerja Komponen

### 1. Load Existing File

- Saat component mount, akan mengecek database untuk record terbaru
- Verifikasi apakah file masih ada di storage
- Jika file tidak ada di storage, database record akan dibersihkan

### 2. Upload File

- Upload file ke storage dengan nama unik
- Jika ada file sebelumnya, hapus dari storage terlebih dahulu
- Simpan/update public URL ke database
- Sinkronisasi state component

### 3. Delete File

- Hapus file dari storage
- Set `template_mr` menjadi `null` di database
- Reset state component

### 4. Download File

- Download file langsung dari storage menggunakan stored path
- Buat temporary URL untuk download browser

## Sinkronisasi Data

Komponen memastikan sinkronisasi antara storage dan database:

1. **Konsistensi Data**: Selalu verifikasi keberadaan file di storage
2. **Cleanup**: Otomatis bersihkan record database jika file tidak ada
3. **Atomic Operations**: Upload dan database operation dalam satu transaction
4. **Error Handling**: Rollback jika salah satu operasi gagal

## Keamanan

1. **File Type Validation**: Hanya menerima file Excel (.xlsx, .xls)
2. **File Size Limit**: Maksimal 10MB per file
3. **Unique Naming**: Menggunakan userId dan timestamp untuk menghindari collision
4. **RLS Policies**: Implementasikan sesuai kebutuhan authentication

## Monitoring

Monitor hal-hal berikut:

1. Konsistensi data antara storage dan database
2. Orphaned files di storage
3. Orphaned records di database
4. Storage usage dan cleanup

## Environment Variables

Pastikan environment variables berikut sudah diset:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
