-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.apd_bengkel (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL UNIQUE,
  CONSTRAINT apd_bengkel_pkey PRIMARY KEY (id)
);
CREATE TABLE public.apd_daily (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  apd_id bigint,
  tanggal date,
  nama text,
  bengkel_id bigint,
  qty bigint,
  periode date,
  CONSTRAINT apd_daily_pkey PRIMARY KEY (id),
  CONSTRAINT apd_daily_apd_id_fkey FOREIGN KEY (apd_id) REFERENCES public.apd_items(id),
  CONSTRAINT apd_daily_bengkel_id_fkey FOREIGN KEY (bengkel_id) REFERENCES public.apd_bengkel(id)
);
CREATE TABLE public.apd_files (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  file_url text,
  nama_file text,
  jenis_file text,
  user_id text,
  CONSTRAINT apd_files_pkey PRIMARY KEY (id)
);
CREATE TABLE public.apd_items (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL DEFAULT ''::text UNIQUE,
  satuan text,
  jumlah bigint,
  CONSTRAINT apd_items_pkey PRIMARY KEY (id)
);
CREATE TABLE public.apd_monthly (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  apd_id bigint,
  periode date,
  stock_awal bigint DEFAULT '0'::bigint,
  realisasi bigint DEFAULT '0'::bigint,
  distribusi bigint DEFAULT '0'::bigint,
  saldo_akhir bigint DEFAULT '0'::bigint,
  satuan text,
  CONSTRAINT apd_monthly_pkey PRIMARY KEY (id),
  CONSTRAINT apd_monthly_apd_id_fkey FOREIGN KEY (apd_id) REFERENCES public.apd_items(id)
);
CREATE TABLE public.apd_peminjaman (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nama_peminjam text,
  divisi text,
  nama_apd text,
  tanggal_pinjam date,
  tanggal_kembali date,
  status text DEFAULT 'Dipinjam'::text,
  CONSTRAINT apd_peminjaman_pkey PRIMARY KEY (id)
);
CREATE TABLE public.divisi (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nama_divisi text NOT NULL UNIQUE,
  CONSTRAINT divisi_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pegawai (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nama text,
  nip character varying DEFAULT '20'::character varying,
  divisi_id bigint,
  posisi_id bigint,
  size_sepatu real,
  jenis_sepatu character varying DEFAULT '10'::character varying,
  warna_katelpack character varying DEFAULT '20'::character varying,
  size_katelpack character varying DEFAULT '10'::character varying,
  warna_helm character varying DEFAULT '20'::character varying,
  CONSTRAINT pegawai_pkey PRIMARY KEY (id),
  CONSTRAINT pegawai_divisi_id_fkey FOREIGN KEY (divisi_id) REFERENCES public.divisi(id),
  CONSTRAINT pegawai_posisi_id_fkey FOREIGN KEY (posisi_id) REFERENCES public.posisi(id)
);
CREATE TABLE public.posisi (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nama_posisi text NOT NULL UNIQUE,
  CONSTRAINT posisi_pkey PRIMARY KEY (id)
);