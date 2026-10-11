-- Jalankan di Supabase SQL Editor sebelum menerima data dengan Kepala Keluarga
-- yang bukan jemaat GPIB Ebenhaezer.

alter table public.anggota
  add column if not exists is_jemaat boolean not null default true;

-- Kolom profil tetap diwajibkan oleh formulir untuk jemaat. Kolom dibuat
-- nullable agar baris Kepala Keluarga nonjemaat tidak perlu berisi data palsu.
alter table public.anggota alter column jenis_kelamin drop not null;
alter table public.anggota alter column tempat_lahir drop not null;
alter table public.anggota alter column tanggal_lahir drop not null;
alter table public.anggota alter column alamat drop not null;
alter table public.anggota alter column sektor drop not null;
alter table public.anggota alter column pendidikan_terakhir drop not null;
alter table public.anggota alter column pekerjaan drop not null;
alter table public.anggota alter column kategorial drop not null;
alter table public.anggota alter column peran_pelayanan drop not null;
alter table public.anggota alter column golongan_darah drop not null;

create or replace function public.submit_keluarga_v2(
  p_keluarga jsonb,
  p_anggota jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_keluarga_id uuid;
  v_anggota jsonb;
  v_is_kepala boolean;
  v_is_jemaat boolean;
  v_kolom text;
  v_peristiwa text;
begin
  if jsonb_typeof(p_anggota) is distinct from 'array' then
    raise exception 'Data anggota keluarga tidak valid';
  end if;

  if jsonb_array_length(p_anggota) = 0 then
    raise exception 'Data anggota keluarga tidak valid';
  end if;

  if (
    select 1
    from jsonb_array_elements(p_anggota) as item(value)
    where coalesce((value->>'is_kepala_keluarga')::boolean, false)
    limit 1
  ) is null then
    raise exception 'Kepala keluarga wajib disertakan';
  end if;

  insert into public.keluarga (nama_kepala_keluarga, diisi_oleh)
  values (
    nullif(btrim(p_keluarga->>'nama_kepala_keluarga'), ''),
    nullif(btrim(p_keluarga->>'diisi_oleh'), '')
  )
  returning id into v_keluarga_id;

  for v_anggota in select value from jsonb_array_elements(p_anggota) as item(value)
  loop
    v_is_kepala := coalesce((v_anggota->>'is_kepala_keluarga')::boolean, false);
    v_is_jemaat := coalesce((v_anggota->>'is_jemaat')::boolean, true);

    if not v_is_jemaat and not v_is_kepala then
      raise exception 'Hanya kepala keluarga yang dapat ditandai bukan jemaat';
    end if;

    if v_is_jemaat then
      foreach v_kolom in array array[
        'nama_lengkap', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir',
        'alamat', 'sektor', 'pendidikan_terakhir', 'pekerjaan',
        'pengalaman_bekerja', 'masa_tinggal', 'hobi', 'keahlian',
        'status_baptis', 'status_sidi', 'status_menikah', 'kategorial',
        'peran_pelayanan', 'golongan_darah', 'riwayat_penyakit'
      ] loop
        if nullif(btrim(v_anggota->>v_kolom), '') is null then
          raise exception 'Kolom wajib belum lengkap: %', v_kolom;
        end if;
      end loop;

      if not v_is_kepala
         and nullif(btrim(v_anggota->>'status_keluarga'), '') is null then
        raise exception 'Status dalam keluarga wajib diisi';
      end if;

      if (v_anggota->>'pekerjaan') like 'Pekerja%'
         and nullif(btrim(v_anggota->>'detail_pekerjaan_khusus'), '') is null then
        raise exception 'Detail pekerjaan wajib diisi';
      end if;

      foreach v_peristiwa in array array['baptis', 'sidi', 'menikah'] loop
        if v_anggota->>('status_' || v_peristiwa) = 'Sudah'
           and (
             nullif(v_anggota->>('tanggal_' || v_peristiwa), '') is null
             or nullif(btrim(v_anggota->>('tempat_' || v_peristiwa)), '') is null
           ) then
          raise exception 'Tanggal dan tempat % wajib diisi', v_peristiwa;
        end if;
      end loop;
    end if;

    insert into public.anggota (
      keluarga_id,
      is_kepala_keluarga,
      is_jemaat,
      nama_lengkap,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      sektor,
      status_keluarga,
      status_keluarga_lainnya,
      pendidikan_terakhir,
      pekerjaan,
      pekerjaan_lainnya,
      detail_pekerjaan_khusus,
      pengalaman_bekerja,
      masa_bekerja,
      masa_tinggal,
      hobi,
      keahlian,
      kategorial,
      peran_pelayanan,
      peran_pelayanan_lainnya,
      golongan_darah,
      riwayat_penyakit,
      status_baptis,
      tanggal_baptis,
      tempat_baptis,
      status_sidi,
      tanggal_sidi,
      tempat_sidi,
      status_menikah,
      tanggal_menikah,
      tempat_menikah
    ) values (
      v_keluarga_id,
      v_is_kepala,
      v_is_jemaat,
      nullif(btrim(v_anggota->>'nama_lengkap'), ''),
      case when v_is_jemaat then nullif(v_anggota->>'jenis_kelamin', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'tempat_lahir', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'tanggal_lahir', '')::date end,
      case when v_is_jemaat then nullif(v_anggota->>'alamat', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'sektor', '') end,
      case when v_is_jemaat then coalesce(nullif(v_anggota->>'status_keluarga', ''), 'Kepala Keluarga') else 'Bukan Jemaat' end,
      case when v_is_jemaat then nullif(v_anggota->>'status_keluarga_lainnya', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'pendidikan_terakhir', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'pekerjaan', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'pekerjaan_lainnya', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'detail_pekerjaan_khusus', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'pengalaman_bekerja', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'masa_bekerja', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'masa_tinggal', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'hobi', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'keahlian', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'kategorial', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'peran_pelayanan', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'peran_pelayanan_lainnya', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'golongan_darah', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'riwayat_penyakit', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'status_baptis', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'tanggal_baptis', '')::date end,
      case when v_is_jemaat then nullif(v_anggota->>'tempat_baptis', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'status_sidi', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'tanggal_sidi', '')::date end,
      case when v_is_jemaat then nullif(v_anggota->>'tempat_sidi', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'status_menikah', '') end,
      case when v_is_jemaat then nullif(v_anggota->>'tanggal_menikah', '')::date end,
      case when v_is_jemaat then nullif(v_anggota->>'tempat_menikah', '') end
    );
  end loop;
end;
$$;

revoke all on function public.submit_keluarga_v2(jsonb, jsonb) from public;
grant execute on function public.submit_keluarga_v2(jsonb, jsonb) to anon, authenticated;
