"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { aktif, terisi, kosong } from "@/lib/validasi";

// Keterangan kecil per kolom (kunci = nama kolom di database)
const BANTU = {
  jenis_kelamin: "Sesuai yang tertera di KTP.",
  tempat_lahir: "Kota atau kabupaten tempat lahir.",
  tanggal_lahir: "Ketik langsung: tanggal/bulan/tahun, contoh 05/03/1990.",
  alamat: "Alamat tempat tinggal saat ini, bukan alamat KTP jika berbeda.",
  sektor:
    "Sektor pelayanan tempat keluarga terdaftar di gereja. Tanyakan ke majelis jika belum tahu.",
  status_keluarga: "Hubungan orang ini dengan Kepala Keluarga.",
  pendidikan_terakhir:
    "Pendidikan tertinggi yang sudah diselesaikan. Jika masih sekolah, pilih jenjang sebelumnya.",
  pekerjaan:
    "Pekerjaan utama saat ini. Pilih Pelajar atau Mahasiswa jika masih menempuh pendidikan.",
  detail_pekerjaan_khusus:
    "Contoh: bidang atau jenis pekerjaan yang dilakukan sehari-hari.",
  pengalaman_bekerja:
    "Pekerjaan yang pernah dijalani sebelumnya. Isi '-' jika tidak ada.",
  masa_bekerja:
    "Sudah berapa lama bekerja di tempat saat ini, contoh: 5 tahun.",
  masa_tinggal: "Sudah berapa lama tinggal di alamat ini, contoh: 10 tahun.",
  hobi: "Kegiatan yang disukai di waktu luang. Isi '-' jika tidak ada.",
  keahlian:
    "Keterampilan khusus, contoh: menjahit, musik, komputer. Isi '-' jika tidak ada.",
  kategorial:
    "Kelompok pelayanan sesuai usia atau status (PA, PT, GP, PKP, PKB, PKLU).",
  peran_pelayanan:
    "Tugas yang sedang dijalani di gereja. Pilih 'Belum ada peran' jika belum ada.",
  golongan_darah:
    "Untuk keperluan darurat. Lihat kartu donor atau hasil tes darah.",
  riwayat_penyakit:
    "Penyakit berat atau kronis yang perlu diketahui gereja. Isi '-' jika tidak ada.",
};

const parseIso = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

// Input tanggal ketik manual (DD/MM/YYYY), tersimpan sebagai YYYY-MM-DD
function InputTanggal({ value, onChange, className }) {
  const [teks, setTeks] = useState(parseIso(value));
  const [salah, setSalah] = useState(false);

  const handle = (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 8);
    let f = d.slice(0, 2);
    if (d.length > 2) f += "/" + d.slice(2, 4);
    if (d.length > 4) f += "/" + d.slice(4);
    setTeks(f);

    if (d.length < 8) {
      setSalah(false);
      return onChange("");
    }
    const dd = +d.slice(0, 2),
      mm = +d.slice(2, 4),
      yy = +d.slice(4);
    const t = new Date(yy, mm - 1, dd);
    const ok =
      yy >= 1900 &&
      t <= new Date() &&
      t.getFullYear() === yy &&
      t.getMonth() === mm - 1 &&
      t.getDate() === dd;
    setSalah(!ok);
    onChange(ok ? `${d.slice(4)}-${d.slice(2, 4)}-${d.slice(0, 2)}` : "");
  };

  return (
    <>
      <Input
        inputMode="numeric"
        placeholder="DD/MM/YYYY"
        className={className}
        value={teks}
        onChange={handle}
      />
      {salah && (
        <p className="text-xs text-destructive">Tanggal tidak valid.</p>
      )}
    </>
  );
}

// Ganti {nama} pada label dengan nama tebal berwarna
function Pertanyaan({ label, nama }) {
  const [a, b = ""] = label.split("{nama}");
  return (
    <Label className="block whitespace-normal break-words leading-snug">
      {a}
      <span className="font-bold text-emerald-700 dark:text-emerald-400">
        {nama}
      </span>
      {b}
    </Label>
  );
}

export default function FormAnggota({ orang, kk, ubah, selesai }) {
  const [cek, setCek] = useState(false);
  const daftar = aktif(orang);
  const merah = (f) => (cek && !terisi(f, orang) ? "border-destructive" : "");

  // Otomatis isi dari Kepala Keluarga (tetap bisa diubah)
  useEffect(() => {
    if (orang.kk) return;
    const s = {};
    ["alamat", "sektor", "masa_tinggal"].forEach((k) => {
      if (kk[k] && !orang[k]) s[k] = kk[k];
    });
    if (Object.keys(s).length) ubah(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lanjut = () => {
    if (daftar.every((f) => terisi(f, orang))) return selesai();
    setCek(true);
    toast.error("Masih ada kolom yang belum diisi.");
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-5 overflow-x-hidden p-4 sm:p-6">
      <div>
        <h1 className="break-words text-2xl font-semibold">
          {orang.nama_lengkap}
        </h1>
        <p className="text-sm text-muted-foreground">
          Semua kolom wajib diisi. Isi "-" jika tidak ada.
        </p>
      </div>

      {daftar.map((f) => (
        <div key={f.k} className="min-w-0 space-y-2">
          <Pertanyaan label={f.label} nama={orang.nama_lengkap} />
          {BANTU[f.k] && (
            <p className="break-words text-xs text-muted-foreground">
              {BANTU[f.k]}
            </p>
          )}

          {f.t === "select" ? (
            <Select
              value={orang[f.k] || ""}
              onValueChange={(v) => ubah({ [f.k]: v })}
            >
              <SelectTrigger
                className={`h-auto min-h-9 w-full whitespace-normal py-2 text-left [&>span]:line-clamp-none [&>span]:whitespace-normal [&>span]:break-words ${merah(f)}`}
              >
                <SelectValue placeholder="Pilih" />
              </SelectTrigger>
              <SelectContent className="max-w-[calc(100vw-2rem)]">
                {f.o.map((x) => (
                  <SelectItem
                    key={x}
                    value={x}
                    className="whitespace-normal break-words"
                  >
                    {x}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : f.t === "area" ? (
            <Textarea
              className={merah(f)}
              value={orang[f.k] || ""}
              onChange={(e) => ubah({ [f.k]: e.target.value })}
            />
          ) : f.t === "date" ? (
            <InputTanggal
              className={merah(f)}
              value={orang[f.k]}
              onChange={(v) => ubah({ [f.k]: v })}
            />
          ) : (
            <Input
              type={f.t}
              className={merah(f)}
              value={orang[f.k] || ""}
              onChange={(e) => ubah({ [f.k]: e.target.value })}
            />
          )}

          {f.lain && orang[f.k] === "Lainnya" && (
            <Input
              placeholder="Sebutkan"
              className={
                cek && kosong(orang[f.lain]) ? "border-destructive" : ""
              }
              value={orang[f.lain] || ""}
              onChange={(e) => ubah({ [f.lain]: e.target.value })}
            />
          )}
          {f.nol && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ubah({ [f.k]: "-" })}
            >
              Tidak ada / -
            </Button>
          )}
        </div>
      ))}

      <div className="flex flex-wrap justify-between gap-2 pt-2">
        <Button variant="outline" onClick={selesai}>
          Kembali ke daftar
        </Button>
        <Button onClick={lanjut}>Selanjutnya</Button>
      </div>
    </div>
  );
}
