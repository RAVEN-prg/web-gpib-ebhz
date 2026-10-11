# Kepala keluarga bukan jemaat

Sebelum menerima isian dengan Kepala Keluarga nonjemaat, jalankan
[`kepala-keluarga-non-jemaat.sql`](./kepala-keluarga-non-jemaat.sql) di Supabase
SQL Editor. Migrasi ini menambahkan status keanggotaan, mengizinkan profil
nonjemaat disimpan tanpa data profil palsu, dan membuat RPC baru yang dipakai
formulir.

Di formulir, Kepala Keluarga tetap memasukkan nama lalu memilih apakah ia jemaat
GPIB Ebenhaezer. Jika memilih **Tidak**, pertanyaan profilnya dilewati dan kartu
progres tercatat 100%. Anggota keluarga lain tetap melengkapi data seperti biasa.

Jemaat yang sudah ada otomatis mendapat `is_jemaat = true`. Fungsi RPC lama
`submit_keluarga` tidak dihapus.
