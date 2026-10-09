import {
  KATEGORIAL,
  PENDIDIKAN,
  PERAN,
  SEKTOR,
  SUDAH_BELUM,
} from "@/lib/opsi";

export const PILIHAN_FILTER = [
  { kolom: "jenis_kelamin", label: "Jenis Kelamin", opsi: ["Laki-laki", "Perempuan"] },
  { kolom: "sektor", label: "Sektor", opsi: SEKTOR },
  { kolom: "pendidikan_terakhir", label: "Pendidikan Terakhir", opsi: PENDIDIKAN },
  { kolom: "kategorial", label: "Kategorial", opsi: KATEGORIAL },
  { kolom: "peran_pelayanan", label: "Peran Pelayanan", opsi: PERAN },
  { kolom: "status_menikah", label: "Status Menikah", opsi: SUDAH_BELUM },
  { kolom: "status_sidi", label: "Status Sidi", opsi: SUDAH_BELUM },
];

export const pilih = (nilai, lainnya) =>
  nilai === "Lainnya" && lainnya ? `Lainnya: ${lainnya}` : nilai;

export const peranOf = (anggota) =>
  pilih(anggota.peran_pelayanan, anggota.peran_pelayanan_lainnya);

export function cocokAnggota(anggota, cari, filters) {
  const q = cari.trim().toLowerCase();
  const cocokCari =
    !q ||
    [
      anggota.nama_lengkap,
      anggota.kategorial,
      peranOf(anggota),
      anggota.sektor,
      anggota.keluarga?.nama_kepala_keluarga,
    ].some((nilai) => (nilai || "").toLowerCase().includes(q));

  const cocokFilter = filters.every((filter) => {
    if (!filter.kolom || !filter.nilai) return true;
    const nilai =
      filter.kolom === "peran_pelayanan"
        ? peranOf(anggota)
        : anggota[filter.kolom];
    return filter.nilai === "Lainnya"
      ? nilai === "Lainnya" || nilai?.startsWith("Lainnya:")
      : nilai === filter.nilai;
  });

  return cocokCari && cocokFilter;
}
