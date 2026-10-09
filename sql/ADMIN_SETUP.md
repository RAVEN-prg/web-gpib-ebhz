# Menyiapkan akun admin

Login admin memakai Supabase Auth. Aplikasi tidak menyediakan pendaftaran,
menyimpan password, atau mengirim password ke kode aplikasi. Supabase Auth
menerima email dan password, jadi gunakan email pilihan Anda sebagai username.

1. Buka **Supabase Dashboard → Authentication → Settings** dan nonaktifkan
   pendaftaran publik (Allow new users to sign up).
2. Jalankan [`admin.sql`](./admin.sql) melalui **SQL Editor**.
3. Buka **Authentication → Users → Add user**, lalu masukkan email dan password
   admin yang ingin Anda gunakan. Simpan user tersebut.
4. Salin UUID user dari daftar **Authentication → Users**.
5. Ganti UUID contoh di bagian akhir `admin.sql`, lalu jalankan perintah
   `INSERT INTO public.admin_users ...` itu di SQL Editor. UUID tersebut memberi
   akun hak admin.
6. Buka halaman `/admin` dan login dengan email dan password tadi.

Untuk mencabut akses admin, hapus baris akun dari `public.admin_users`. Jangan
menambahkan service-role key ke variabel `NEXT_PUBLIC_*` atau kode browser.

Kebijakan database membatasi operasi edit/hapus sampai ke Postgres. Menyembunyikan
halaman atau tombol di browser saja tidak memberikan hak akses.
