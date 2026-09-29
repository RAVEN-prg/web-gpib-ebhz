import { SEKTOR, STATUS, PENDIDIKAN, PEKERJAAN, KATEGORIAL, PERAN, DARAH } from "./opsi";

// t: jenis input | o: pilihan | lain: kolom "Lainnya" | nol: ada tombol "Tidak ada / -" | ada: kapan kolom tampil
export const FIELDS = [
  { k: "jenis_kelamin", label: "Jenis kelamin", t: "select", o: ["Laki-laki", "Perempuan"] },
  { k: "tempat_lahir", label: "Tempat lahir", t: "text" },
  { k: "tanggal_lahir", label: "Tanggal lahir", t: "date" },
  { k: "alamat", label: "Alamat saat ini", t: "text" },
  { k: "sektor", label: "Terdata sebagai warga jemaat sektor pelayanan", t: "select", o: SEKTOR },
  { k: "status_keluarga", label: "Status dalam keluarga (hubungan dengan Kepala Keluarga)", t: "select", o: STATUS, lain: "status_keluarga_lainnya", ada: (p) => !p.kk },
  { k: "pendidikan_terakhir", label: "Pendidikan terakhir", t: "select", o: PENDIDIKAN },
  { k: "pekerjaan", label: "Pekerjaan", t: "select", o: PEKERJAAN, lain: "pekerjaan_lainnya" },
  { k: "detail_pekerjaan_khusus", label: "Detail pekerjaan informal / keahlian khusus", t: "area", ada: (p) => p.pekerjaan?.startsWith("Pekerja") },
  { k: "pengalaman_bekerja", label: "Pengalaman bekerja", t: "text", nol: 1 },
  { k: "masa_bekerja", label: "Lama bekerja di tempat saat ini", t: "text", nol: 1 },
  { k: "masa_tinggal", label: "Lama tinggal di alamat saat ini", t: "text", nol: 1 },
  { k: "hobi", label: "Hobi atau minat", t: "text", nol: 1 },
  { k: "keahlian", label: "Keahlian yang dimiliki", t: "text", nol: 1 },
  { k: "kategorial", label: "Kategorial", t: "select", o: KATEGORIAL },
  { k: "peran_pelayanan", label: "Aktif dalam jemaat sebagai", t: "select", o: PERAN, lain: "peran_pelayanan_lainnya" },
  { k: "golongan_darah", label: "Golongan darah", t: "select", o: DARAH },
  { k: "riwayat_penyakit", label: "Riwayat penyakit", t: "area", nol: 1 },
];

export const kosong = (v) => !v || !String(v).trim();
export const aktif = (p) => FIELDS.filter((f) => !f.ada || f.ada(p));
export const terisi = (f, p) =>
  !kosong(p[f.k]) && (!f.lain || p[f.k] !== "Lainnya" || !kosong(p[f.lain]));
export const persen = (p) => {
  const a = aktif(p);
  return Math.round((a.filter((f) => terisi(f, p)).length / a.length) * 100);
};
