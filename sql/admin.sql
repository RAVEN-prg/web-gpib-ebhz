-- Jalankan di Supabase SQL Editor sebelum membuka /admin.
-- Buat akun admin lebih dulu di Authentication > Users. Akun tidak bisa
-- mendaftar dari aplikasi; tambahkan UUID akun tersebut ke admin_users.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.anggota enable row level security;
alter table public.keluarga enable row level security;
-- Halaman database publik saat ini membaca kedua tabel dengan publishable key.
grant select on table public.anggota, public.keluarga to anon, authenticated;

drop policy if exists "Public can read anggota" on public.anggota;
create policy "Public can read anggota"
  on public.anggota for select to anon using (true);

drop policy if exists "Public can read keluarga" on public.keluarga;
create policy "Public can read keluarga"
  on public.keluarga for select to anon using (true);

drop policy if exists "Authenticated can read anggota" on public.anggota;
create policy "Authenticated can read anggota"
  on public.anggota for select to authenticated using (true);

drop policy if exists "Authenticated can read keluarga" on public.keluarga;
create policy "Authenticated can read keluarga"
  on public.keluarga for select to authenticated using (true);

-- Kebijakan RESTRICTIVE mencegah kebijakan permissive lama membuka akses edit.
revoke update, delete on table public.anggota from public, anon;
revoke update, delete on table public.keluarga from public, anon;
grant update, delete on table public.anggota to authenticated;
grant update, delete on table public.keluarga to authenticated;

drop policy if exists "Admin can update anggota" on public.anggota;
create policy "Admin can update anggota"
  on public.anggota for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admin only update anggota guard" on public.anggota;
create policy "Admin only update anggota guard"
  on public.anggota as restrictive for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admin can delete anggota" on public.anggota;
create policy "Admin can delete anggota"
  on public.anggota for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admin only delete anggota guard" on public.anggota;
create policy "Admin only delete anggota guard"
  on public.anggota as restrictive for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admin can update keluarga" on public.keluarga;
create policy "Admin can update keluarga"
  on public.keluarga for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admin only update keluarga guard" on public.keluarga;
create policy "Admin only update keluarga guard"
  on public.keluarga as restrictive for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admin can delete keluarga" on public.keluarga;
create policy "Admin can delete keluarga"
  on public.keluarga for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admin only delete keluarga guard" on public.keluarga;
create policy "Admin only delete keluarga guard"
  on public.keluarga as restrictive for delete to authenticated
  using ((select public.is_admin()));

-- Setelah akun dibuat, ganti UUID dengan id dari Authentication > Users:
insert into public.admin_users (user_id)
values ('bce2d1b8-9373-48f9-b520-06de3b647711');
