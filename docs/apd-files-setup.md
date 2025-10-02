# Setup Database dan Storage untuk APD Files

## Database Setup

### 1. Tabel apd_files

Pastikan tabel `apd_files` sudah dibuat d4. **Unique Naming**: Menggunakan userId, timestamp, dan jenis_file untuk menghindari collisionngan struktur yang dioptimalkan berikut:

```sql
CREATE TABLE public.apd_files (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  file_url text NOT NULL,
  nama_file text NOT NULL,
  jenis_file text NOT NULL, -- 'template_mr', 'berita_serah_terima', 'pengajuan_apd'
  user_id text, -- optional: untuk tracking siapa yang upload
  CONSTRAINT apd_files_pkey PRIMARY KEY (id)
);
```

**Keuntungan struktur baru:**

- **Fleksibilitas**: Satu tabel untuk semua jenis file
- **Skalabilitas**: Mudah menambah jenis file baru tanpa perubahan schema
- **Konsistensi**: Query yang lebih sederhana dan konsisten
- **User Tracking**: Bisa melacak siapa yang upload file tertentu

### 2. Row Level Security (RLS)

Aktifkan RLS dan buat policy sesuai kebutuhan:

```sql
-- Aktifkan RLS
ALTER TABLE public.apd_files ENABLE ROW LEVEL SECURITY;

-- Policy untuk read (user hanya bisa melihat file mereka sendiri)
CREATE POLICY "Users can read own files" ON public.apd_files
FOR SELECT USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Policy untuk insert
CREATE POLICY "Users can insert apd_files" ON public.apd_files
FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

-- Policy untuk update (user hanya bisa update file mereka sendiri)
CREATE POLICY "Users can update own files" ON public.apd_files
FOR UPDATE USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Policy untuk delete (user hanya bisa delete file mereka sendiri)
CREATE POLICY "Users can delete own files" ON public.apd_files
FOR DELETE USING (auth.uid()::text = user_id OR user_id IS NULL);
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

- Saat component mount, akan mengecek database untuk record berdasarkan `jenis_file` dan `user_id`
- Verifikasi apakah file masih ada di storage
- Jika file tidak ada di storage, database record akan dihapus completely

### 2. Upload File

- Upload file ke storage dengan nama unik
- Jika ada file sebelumnya, hapus dari storage terlebih dahulu
- Simpan/update record dengan `file_url`, `nama_file`, `jenis_file`, dan `user_id`
- Sinkronisasi state component

### 3. Delete File

- Hapus file dari storage
- Delete record dari database completely (tidak lagi set null)
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
