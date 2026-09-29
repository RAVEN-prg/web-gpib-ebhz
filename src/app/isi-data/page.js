"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FIELDS, persen } from "@/lib/validasi";
import FormAnggota from "@/components/form-anggota";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const KUNCI = "draft-data-jemaat";
const baru = (kk = false) => ({
  id: Math.random().toString(36).slice(2),
  kk,
  nama_lengkap: "",
  ...(kk ? { status_keluarga: "Kepala Keluarga" } : {}),
});

// Gaya dasar kontrol input (sama dengan form-anggota)
const KONTROL =
  "h-10 border-neutral-200 bg-white shadow-none transition-all duration-200 hover:border-neutral-400 focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/10";

const LANGKAH = { keluarga: 1, pilih: 2, kirim: 3 };

// Peristiwa gereja: tanggal & tempat hanya dikirim jika statusnya "Sudah"
const PERISTIWA = ["baptis", "sidi", "menikah"];

function Bingkai({ className, children }) {
  return (
    <div className={`mx-auto w-full min-w-0 space-y-6 p-4 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

function Judul({ tahap, judul, deskripsi }) {
  return (
    <div className="space-y-2">
      {tahap && (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1 w-8 rounded-full transition-all duration-200 ${
                  n <= LANGKAH[tahap] ? "bg-neutral-900" : "bg-neutral-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-500">
            Langkah {LANGKAH[tahap]} dari 3
          </p>
        </div>
      )}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          {judul}
        </h1>
        {deskripsi && <p className="text-sm text-neutral-500">{deskripsi}</p>}
      </div>
    </div>
  );
}

export default function IsiData() {
  const [orang, setOrang] = useState([baru(true)]);
  const [tahap, setTahap] = useState("keluarga"); // keluarga | pilih | form | kirim
  const [aktifId, setAktifId] = useState(null);
  const [pengisi, setPengisi] = useState("");
  const [setuju, setSetuju] = useState(false);
  const [kirim, setKirim] = useState(false);
  const [sukses, setSukses] = useState(false);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(KUNCI));
      if (d) {
        setOrang(d.orang);
        setTahap(d.tahap === "form" ? "pilih" : d.tahap);
      }
    } catch {}
    setSiap(true);
  }, []);
  useEffect(() => {
    if (siap && !sukses)
      localStorage.setItem(KUNCI, JSON.stringify({ orang, tahap }));
  }, [orang, tahap, siap, sukses]);

  const ubah = (id, patch) =>
    setOrang((l) => l.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const namaOk = orang.every((o) => o.nama_lengkap.trim());
  const semua100 = orang.every((o) => persen(o) === 100);

  async function submit() {
    setKirim(true);
    const KEYS = FIELDS.flatMap((f) => (f.lain ? [f.k, f.lain] : [f.k]));

    const p_anggota = orang.map((o) => {
      // Bentuk objek dasar dari KEYS
      const data = Object.fromEntries(
        KEYS.map((k) => {
          const val = typeof o[k] === "string" ? o[k].trim() : o[k];
          return [k, val ? val : null];
        }),
      );

      // Pastikan jika status != 'Sudah', tanggal & tempat bernilai null
      PERISTIWA.forEach((x) => {
        if (data[`status_${x}`] !== "Sudah") {
          data[`tanggal_${x}`] = null;
          data[`tempat_${x}`] = null;
        } else {
          // Jika status Sudah tapi tanggalnya kosong, jadikan null agar valid di kolom date PostgreSQL
          if (!data[`tanggal_\({x}`]) data[`tanggal_\){x}`] = null;
          if (!data[`tempat_\({x}`]) data[`tempat_\){x}`] = null;
        }
      });

      if (data.pekerjaan === "Pensiunan") {
        data.masa_bekerja = null;
      }

      return {
        is_kepala_keluarga: Boolean(o.kk),
        nama_lengkap: o.nama_lengkap.trim(),
        ...data,
      };
    });

    const { error } = await supabase.rpc("submit_keluarga", {
      p_keluarga: {
        nama_kepala_keluarga: orang[0].nama_lengkap.trim(),
        diisi_oleh: pengisi.trim(),
      },
      p_anggota,
    });

    setKirim(false);
    if (error) {
      console.error("Gagal submit:", error);
      return toast.error(
        "Data belum terkirim. Periksa koneksi lalu coba lagi.",
      );
    }
    localStorage.removeItem(KUNCI);
    setSukses(true);
  }

  function ulang() {
    setOrang([baru(true)]);
    setTahap("keluarga");
    setPengisi("");
    setSetuju(false);
    setSukses(false);
  }

  if (!siap) return null;

  if (sukses)
    return (
      <Bingkai className="max-w-xl pt-12 sm:pt-16">
        <div className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900">
          <Check className="size-5" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Data tersimpan
          </h1>
          <p className="text-pretty text-sm leading-relaxed text-neutral-500">
            Terima kasih. Data keluarga{" "}
            <span className="font-medium text-neutral-900">
              {orang[0].nama_lengkap}
            </span>{" "}
            sudah masuk ke database jemaat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className={buttonVariants()}>
            Kembali ke Home
          </Link>
          <Button variant="outline" onClick={ulang}>
            Isi data keluarga lain
          </Button>
        </div>
      </Bingkai>
    );

  if (tahap === "form") {
    const o = orang.find((x) => x.id === aktifId);
    return (
      <FormAnggota
        key={o.id}
        orang={o}
        kk={orang[0]}
        ubah={(p) => ubah(o.id, p)}
        selesai={() => setTahap("pilih")}
      />
    );
  }

  if (tahap === "pilih")
    return (
      <Bingkai className="max-w-3xl">
        <Judul
          tahap="pilih"
          judul="Pilih anggota untuk diisi"
          deskripsi="Lengkapi data setiap orang sampai 100%."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {orang.map((o) => {
            const p = persen(o);
            return (
              <button
                key={o.id}
                type="button"
                className="group w-full rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/10"
                onClick={() => {
                  setAktifId(o.id);
                  setTahap("form");
                }}
              >
                <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-200 group-hover:border-neutral-400 group-focus-visible:border-neutral-900">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0 break-words text-sm font-medium text-neutral-900">
                      {o.nama_lengkap}
                    </span>
                    <Badge variant={p === 100 ? "default" : "secondary"}>
                      {o.kk
                        ? "Kepala Keluarga"
                        : o.status_keluarga || "Anggota"}
                    </Badge>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-neutral-900 transition-all duration-200"
                      style={{ width: `${p}%` }}
                    />
                  </div>
                  <p className="text-xs tabular-nums text-neutral-500">
                    {p}% terisi
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-6">
          <Button variant="outline" onClick={() => setTahap("keluarga")}>
            Kembali
          </Button>
          <div className="flex items-center gap-3">
            {!semua100 && (
              <span className="text-sm text-neutral-500">
                Semua kartu harus 100%
              </span>
            )}
            <Button disabled={!semua100} onClick={() => setTahap("kirim")}>
              Selanjutnya
            </Button>
          </div>
        </div>
      </Bingkai>
    );

  if (tahap === "kirim")
    return (
      <Bingkai className="max-w-xl">
        <Judul
          tahap="kirim"
          judul="Kirim data"
          deskripsi={`${orang.length} orang dari keluarga ${orang[0].nama_lengkap} siap dikirim.`}
        />
        <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
          <div className="space-y-2 p-4 sm:p-5">
            <Label>Nama Anda (yang mengisi form ini)</Label>
            <Input
              className={KONTROL}
              value={pengisi}
              onChange={(e) => setPengisi(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-start gap-3 p-4 text-sm leading-relaxed text-neutral-500 sm:p-5">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-neutral-900"
              checked={setuju}
              onChange={(e) => setSetuju(e.target.checked)}
            />
            <span>
              Saya menyetujui data ini disimpan dan digunakan untuk pendataan
              jemaat GPIB Ebenhaezer Palangka Raya.
            </span>
          </label>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" onClick={() => setTahap("pilih")}>
            Kembali
          </Button>
          <Button
            disabled={!pengisi.trim() || !setuju || kirim}
            onClick={submit}
          >
            {kirim ? "Mengirim..." : "Kirim data"}
          </Button>
        </div>
      </Bingkai>
    );

  return (
    <Bingkai className="max-w-xl">
      <Judul
        tahap="keluarga"
        judul="Data keluarga"
        deskripsi="Cukup nama dulu. Data lengkap diisi di langkah berikutnya."
      />
      <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        <div className="space-y-2 p-4 sm:p-5">
          <Label>Nama Kepala Keluarga</Label>
          <Input
            className={KONTROL}
            value={orang[0].nama_lengkap}
            onChange={(e) =>
              ubah(orang[0].id, { nama_lengkap: e.target.value })
            }
          />
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          <Label className="leading-snug">
            Anggota keluarga (istri/suami, anak, cucu, famili)
          </Label>
          {orang.slice(1).map((o) => (
            <div key={o.id} className="flex gap-2">
              <Input
                placeholder="Nama anggota"
                className={KONTROL}
                value={o.nama_lengkap}
                onChange={(e) => ubah(o.id, { nama_lengkap: e.target.value })}
              />
              <Button
                variant="outline"
                size="icon"
                aria-label="Hapus anggota"
                className="size-10 shrink-0 text-neutral-500 hover:text-neutral-900"
                onClick={() => setOrang((l) => l.filter((x) => x.id !== o.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => setOrang((l) => [...l, baru()])}
          >
            <Plus className="size-4" />
            Tambah anggota
          </Button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button disabled={!namaOk} onClick={() => setTahap("pilih")}>
          Selanjutnya
        </Button>
      </div>
    </Bingkai>
  );
}
