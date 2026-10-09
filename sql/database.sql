-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.keluarga (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nama_kepala_keluarga text NOT NULL,
  diisi_oleh text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT keluarga_pkey PRIMARY KEY (id)
);
CREATE TABLE public.anggota (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  keluarga_id uuid NOT NULL,
  is_kepala_keluarga boolean NOT NULL DEFAULT false,
  nama_lengkap text NOT NULL,
  jenis_kelamin text NOT NULL CHECK (jenis_kelamin = ANY (ARRAY['Laki-laki'::text, 'Perempuan'::text])),
  tempat_lahir text NOT NULL,
  tanggal_lahir date NOT NULL,
  alamat text NOT NULL,
  sektor text NOT NULL,
  status_keluarga text NOT NULL,
  status_keluarga_lainnya text,
  pendidikan_terakhir text NOT NULL,
  pekerjaan text NOT NULL,
  pekerjaan_lainnya text,
  detail_pekerjaan_khusus text,
  pengalaman_bekerja text,
  masa_bekerja text,
  masa_tinggal text,
  hobi text,
  keahlian text,
  kategorial text NOT NULL,
  peran_pelayanan text NOT NULL,
  peran_pelayanan_lainnya text,
  golongan_darah text NOT NULL CHECK (golongan_darah = ANY (ARRAY['A'::text, 'B'::text, 'AB'::text, 'O'::text])),
  riwayat_penyakit text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status_baptis text CHECK (status_baptis = ANY (ARRAY['Sudah'::text, 'Belum'::text])),
  tanggal_baptis date,
  tempat_baptis text,
  status_sidi text CHECK (status_sidi = ANY (ARRAY['Sudah'::text, 'Belum'::text])),
  tanggal_sidi date,
  tempat_sidi text,
  status_menikah text CHECK (status_menikah = ANY (ARRAY['Sudah'::text, 'Belum'::text])),
  tanggal_menikah date,
  tempat_menikah text,
  CONSTRAINT anggota_pkey PRIMARY KEY (id),
  CONSTRAINT anggota_keluarga_id_fkey FOREIGN KEY (keluarga_id) REFERENCES public.keluarga(id)
);