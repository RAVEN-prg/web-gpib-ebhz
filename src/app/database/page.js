"use client";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
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
    if (!q) return data;
    return data.filter((a) =>
      [
        a.nama_lengkap,
        a.kategorial,
        peranOf(a),
        a.sektor,
        a.keluarga?.nama_kepala_keluarga,
      ].some((v) => (v || "").toLowerCase().includes(q)),
    );
  }, [data, cari]);

  return (
    <div className="mx-auto w-full min-w-0 max-w-4xl space-y-6 p-4 sm:p-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Database jemaat
        </h1>
        <p className="text-sm tabular-nums text-neutral-500">
          {muat
            ? "Memuat data..."
            : `${hasil.length} dari ${data.length} orang`}
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
        <Input
          className={`pl-9 ${KONTROL}`}
          placeholder="Cari nama, pelkat, peran, sektor, atau kepala keluarga"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
        />
      </div>

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

            {!muat && !galat && hasil.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-neutral-500"
                >
                  {cari
                    ? `Tidak ada hasil untuk "${cari}".`
                    : "Belum ada data jemaat."}
                </td>
              </tr>
            )}

            {hasil.map((a) => (
              <tr
                key={a.id}
                className="transition-colors duration-200 hover:bg-neutral-50"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-900">
                    {a.nama_lengkap}
                  </div>
                  {a.is_kepala_keluarga && (
                    <div className="text-xs text-neutral-500">
                      Kepala Keluarga
                    </div>
                  )}
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
