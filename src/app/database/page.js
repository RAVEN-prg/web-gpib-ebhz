"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Filter, Plus, Search, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  KATEGORIAL,
  PENDIDIKAN,
  PERAN,
  SEKTOR,
  SUDAH_BELUM,
} from "@/lib/opsi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PILIHAN_FILTER = [
  { kolom: "jenis_kelamin", label: "Jenis Kelamin", opsi: ["Laki-laki", "Perempuan"] },
  { kolom: "sektor", label: "Sektor", opsi: SEKTOR },
  { kolom: "pendidikan_terakhir", label: "Pendidikan Terakhir", opsi: PENDIDIKAN },
  { kolom: "kategorial", label: "Kategorial", opsi: KATEGORIAL },
  { kolom: "peran_pelayanan", label: "Peran Pelayanan", opsi: PERAN },
  { kolom: "status_menikah", label: "Status Menikah", opsi: SUDAH_BELUM },
  { kolom: "status_sidi", label: "Status Sidi", opsi: SUDAH_BELUM },
];

// Gaya dasar kontrol input (sama dengan form-anggota)
const KONTROL =
  "h-10 border-neutral-200 bg-white shadow-none transition-all duration-200 hover:border-neutral-400 focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/10";

// Nilai "Lainnya" diganti isian manual jika ada
const pilih = (nilai, lainnya) =>
  nilai === "Lainnya" && lainnya ? `Lainnya: ${lainnya}` : nilai;

const peranOf = (a) => pilih(a.peran_pelayanan, a.peran_pelayanan_lainnya);

const tanggal = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "-";
};

// Baptis / sidi / menikah: "Sudah (tanggal, tempat)" atau "Belum"
const riwayat = (status, tgl, tempat) =>
  status === "Sudah" ? `Sudah (${tanggal(tgl)}, ${tempat || "-"})` : status;

// Kelompok field pada panel detail
const KELOMPOK = [
  {
    judul: "Data pribadi",
    baris: [
      ["Nama lengkap", (a) => a.nama_lengkap],
      ["Jenis kelamin", (a) => a.jenis_kelamin],
      ["Tempat lahir", (a) => a.tempat_lahir],
      ["Tanggal lahir", (a) => tanggal(a.tanggal_lahir)],
      ["Golongan darah", (a) => a.golongan_darah],
      ["Riwayat penyakit", (a) => a.riwayat_penyakit],
    ],
  },
  {
    judul: "Keluarga & tempat tinggal",
    baris: [
      ["Kepala keluarga", (a) => a.keluarga?.nama_kepala_keluarga],
      [
        "Status dalam keluarga",
        (a) => pilih(a.status_keluarga, a.status_keluarga_lainnya),
      ],
      ["Alamat", (a) => a.alamat],
      ["Sektor", (a) => a.sektor],
      ["Masa tinggal", (a) => a.masa_tinggal],
    ],
  },
  {
    judul: "Pendidikan & pekerjaan",
    baris: [
      ["Pendidikan terakhir", (a) => a.pendidikan_terakhir],
      ["Pekerjaan", (a) => pilih(a.pekerjaan, a.pekerjaan_lainnya)],
      ["Detail pekerjaan", (a) => a.detail_pekerjaan_khusus],
      ["Pengalaman bekerja", (a) => a.pengalaman_bekerja],
      ["Masa bekerja", (a) => a.masa_bekerja],
      ["Hobi", (a) => a.hobi],
      ["Keahlian", (a) => a.keahlian],
    ],
  },
  {
    judul: "Baptis, sidi & pernikahan",
    baris: [
      [
        "Baptis",
        (a) => riwayat(a.status_baptis, a.tanggal_baptis, a.tempat_baptis),
      ],
      ["Sidi", (a) => riwayat(a.status_sidi, a.tanggal_sidi, a.tempat_sidi)],
      [
        "Pernikahan",
        (a) => riwayat(a.status_menikah, a.tanggal_menikah, a.tempat_menikah),
      ],
    ],
  },
  {
    judul: "Pelayanan di gereja",
    baris: [
      ["Kategorial (Pelkat)", (a) => a.kategorial],
      ["Peran pelayanan", peranOf],
    ],
  },
  {
    judul: "Pendataan",
    baris: [
      ["Diisi oleh", (a) => a.keluarga?.diisi_oleh],
      [
        "Waktu pengisian",
        (a) =>
          a.created_at
            ? new Date(a.created_at).toLocaleString("id-ID", {
                dateStyle: "long",
                timeStyle: "short",
              })
            : null,
      ],
    ],
  },
];

export default function Database() {
  const [data, setData] = useState([]);
  const [muat, setMuat] = useState(true);
  const [galat, setGalat] = useState(false);
  const [cari, setCari] = useState("");
  const [terpilih, setTerpilih] = useState(null);
  const [hanyaKepala, setHanyaKepala] = useState(false);
  const [keluargaTerbuka, setKeluargaTerbuka] = useState(() => new Set());
  const [filterTerbuka, setFilterTerbuka] = useState(false);
  const [filters, setFilters] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("anggota")
        .select("*, keluarga(nama_kepala_keluarga, diisi_oleh)")
        .order("nama_lengkap");
      if (error) setGalat(true);
      else setData(data || []);
      setMuat(false);
    })();
  }, []);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return data.filter((a) => {
      const cocokCari = !q || [
        a.nama_lengkap,
        a.kategorial,
        peranOf(a),
        a.sektor,
        a.keluarga?.nama_kepala_keluarga,
      ].some((v) => (v || "").toLowerCase().includes(q));
      const cocokFilter = filters.every((filter) => {
        if (!filter.kolom || !filter.nilai) return true;
        const nilai = filter.kolom === "peran_pelayanan" ? peranOf(a) : a[filter.kolom];
        return filter.nilai === "Lainnya"
          ? nilai === "Lainnya" || nilai?.startsWith("Lainnya:")
          : nilai === filter.nilai;
      });
      return cocokCari && cocokFilter;
    });
  }, [data, cari, filters]);

  const barisTampil = useMemo(() => {
    if (!hanyaKepala) return hasil.map((a) => ({ a }));

    const cocok = new Set(hasil.map((a) => a.keluarga_id));
    const kepala = data.filter(
      (a) => a.is_kepala_keluarga && cocok.has(a.keluarga_id),
    );
    return kepala.flatMap((a) => {
      const anggota = data.filter(
        (orang) =>
          orang.keluarga_id === a.keluarga_id &&
          !orang.is_kepala_keluarga &&
          hasil.some((cocok) => cocok.id === orang.id),
      );
      return [
        { a, anggota },
        ...(keluargaTerbuka.has(a.keluarga_id)
          ? anggota.map((anak) => ({ a: anak, anak: true }))
          : []),
      ];
    });
  }, [data, hasil, hanyaKepala, keluargaTerbuka]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-6 p-4 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Database jemaat
        </h1>
        <p className="text-sm tabular-nums text-neutral-500">
          {muat
            ? "Memuat data..."
            : hanyaKepala
              ? `${barisTampil.filter((baris) => !baris.anak).length} keluarga dari ${data.length} orang`
              : `${hasil.length} dari ${data.length} orang`}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            className={`pl-9 ${KONTROL}`}
            placeholder="Cari nama, pelkat, peran, sektor, atau kepala keluarga"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant={hanyaKepala ? "default" : "outline"}
          className="h-10 shrink-0"
          aria-pressed={hanyaKepala}
          onClick={() => {
            setHanyaKepala((aktif) => !aktif);
            setKeluargaTerbuka(new Set());
          }}
        >
          Kepala keluarga
        </Button>
        <Button
          type="button"
          variant={filterTerbuka || filters.some((filter) => filter.nilai) ? "default" : "outline"}
          className="h-10 shrink-0"
          aria-expanded={filterTerbuka}
          onClick={() => setFilterTerbuka((terbuka) => !terbuka)}
        >
          <Filter className="size-4" />
          Filter{filters.some((filter) => filter.nilai)
            ? ` (${filters.filter((filter) => filter.nilai).length})`
            : ""}
        </Button>
      </div>

      {filterTerbuka && (
        <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4" aria-label="Filter database jemaat">
          {filters.length === 0 ? (
            <p className="text-sm text-neutral-500">Tambahkan kolom untuk mulai memfilter data.</p>
          ) : (
            <div className="space-y-2">
              {filters.map((filter, index) => {
                const pilihan = PILIHAN_FILTER.find((item) => item.kolom === filter.kolom);
                const kolomTersedia = PILIHAN_FILTER.filter(
                  (item) =>
                    item.kolom === filter.kolom ||
                    !filters.some((lain, i) => i !== index && lain.kolom === item.kolom),
                );
                return (
                  <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <Select
                      value={filter.kolom}
                      onValueChange={(kolom) =>
                        setFilters((sebelumnya) =>
                          sebelumnya.map((item, i) =>
                            i === index ? { kolom, nilai: "" } : item,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className={`w-full ${KONTROL}`}>
                        <SelectValue placeholder="Pilih kolom" />
                      </SelectTrigger>
                      <SelectContent>
                        {kolomTersedia.map((item) => (
                          <SelectItem key={item.kolom} value={item.kolom}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={filter.nilai}
                      disabled={!pilihan}
                      onValueChange={(nilai) =>
                        setFilters((sebelumnya) =>
                          sebelumnya.map((item, i) =>
                            i === index ? { ...item, nilai } : item,
                          ),
                        )
                      }
                    >
                      <SelectTrigger className={`w-full ${KONTROL}`}>
                        <SelectValue placeholder="Pilih nilai" />
                      </SelectTrigger>
                      <SelectContent>
                        {pilihan?.opsi.map((nilai) => (
                          <SelectItem key={nilai} value={nilai}>
                            {nilai}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="justify-self-end text-neutral-500"
                      aria-label="Hapus filter"
                      onClick={() =>
                        setFilters((sebelumnya) =>
                          sebelumnya.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={filters.length >= PILIHAN_FILTER.length}
              onClick={() => setFilters((sebelumnya) => [...sebelumnya, { kolom: "", nilai: "" }])}
            >
              <Plus className="size-4" />
              Tambah filter
            </Button>
            {filters.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setFilters([])}>
                Hapus semua
              </Button>
            )}
          </div>
        </section>
      )}

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Pelkat</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Peran
              </th>
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {muat &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={4} className="px-4 py-3">
                    <Skeleton className="h-6 w-full bg-neutral-100" />
                  </td>
                </tr>
              ))}

            {!muat && galat && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <p className="font-medium text-destructive">
                    Data gagal dimuat.
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-neutral-500">
                    Periksa koneksi, lalu muat ulang halaman. Jika tetap gagal,
                    cek policy SELECT pada tabel di Supabase.
                  </p>
                </td>
              </tr>
            )}

            {!muat && !galat && barisTampil.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-neutral-500"
                >
                  {cari
                    ? `Tidak ada hasil untuk "${cari}".`
                    : filters.some((filter) => filter.nilai)
                      ? "Tidak ada data yang cocok dengan filter."
                      : "Belum ada data jemaat."}
                </td>
              </tr>
            )}

            {barisTampil.map(({ a, anggota = [], anak = false }) => (
              <tr
                key={a.id}
                className={`transition-colors duration-200 hover:bg-neutral-50 ${anak ? "bg-neutral-50/70" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {hanyaKepala && !anak && anggota.length > 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-8 shrink-0"
                        aria-label={`${keluargaTerbuka.has(a.keluarga_id) ? "Tutup" : "Buka"} anggota keluarga ${a.nama_lengkap}`}
                        aria-expanded={keluargaTerbuka.has(a.keluarga_id)}
                        onClick={() =>
                          setKeluargaTerbuka((sebelumnya) => {
                            const berikutnya = new Set(sebelumnya);
                            if (berikutnya.has(a.keluarga_id)) berikutnya.delete(a.keluarga_id);
                            else berikutnya.add(a.keluarga_id);
                            return berikutnya;
                          })
                        }
                      >
                        <ChevronRight
                          className={`size-4 transition-transform ${keluargaTerbuka.has(a.keluarga_id) ? "rotate-90" : ""}`}
                        />
                      </Button>
                    ) : hanyaKepala && !anak ? (
                      <span className="size-8 shrink-0" />
                    ) : null}
                    <div className={anak ? "pl-2" : ""}>
                      <div className={`font-medium ${anak ? "text-neutral-700" : "text-neutral-900"}`}>
                        {a.nama_lengkap}
                      </div>
                      {anak ? (
                        <div className="text-xs text-neutral-500">
                          {pilih(a.status_keluarga, a.status_keluarga_lainnya) || "Anggota keluarga"}
                        </div>
                      ) : a.is_kepala_keluarga ? (
                        <div className="text-xs text-neutral-500">Kepala Keluarga</div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{a.kategorial}</Badge>
                </td>
                <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">
                  {peranOf(a) || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setTerpilih(a)}
                  >
                    Detail
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!terpilih} onOpenChange={(o) => !o && setTerpilih(null)}>
        <SheetContent className="w-full overflow-y-auto border-neutral-200 bg-white sm:max-w-md">
          {terpilih && (
            <>
              <SheetHeader className="border-b border-neutral-200">
                <SheetTitle className="text-lg font-semibold tracking-tight text-neutral-900">
                  {terpilih.nama_lengkap}
                </SheetTitle>
                <SheetDescription className="text-neutral-500">
                  {terpilih.is_kepala_keluarga
                    ? "Kepala Keluarga"
                    : pilih(
                        terpilih.status_keluarga,
                        terpilih.status_keluarga_lainnya,
                      )}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-6">
                {KELOMPOK.map((g) => (
                  <section key={g.judul} className="space-y-2">
                    <h2 className="text-sm font-semibold text-neutral-900">
                      {g.judul}
                    </h2>
                    <dl className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white text-sm">
                      {g.baris.map(([label, ambil]) => (
                        <div
                          key={label}
                          className="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2.5"
                        >
                          <dt className="text-neutral-500">{label}</dt>
                          <dd className="min-w-0 break-words text-neutral-900">
                            {ambil(terpilih) || "-"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
