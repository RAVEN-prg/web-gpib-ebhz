"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { FIELDS, persen } from "@/lib/validasi";
import FormAnggota from "@/components/form-anggota";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const KUNCI = "draft-data-jemaat";
const baru = (kk = false) => ({
  id: Math.random().toString(36).slice(2),
  kk,
  nama_lengkap: "",
  ...(kk ? { status_keluarga: "Kepala Keluarga" } : {}),
});

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
    const p_anggota = orang.map((o) => ({
      is_kepala_keluarga: o.kk,
      nama_lengkap: o.nama_lengkap.trim(),
      ...Object.fromEntries(KEYS.map((k) => [k, o[k]?.trim() || null])),
      ...(o.pekerjaan === "Pensiunan" ? { masa_bekerja: null } : {}),
    }));
    const { error } = await supabase.rpc("submit_keluarga", {
      p_keluarga: {
        nama_kepala_keluarga: orang[0].nama_lengkap.trim(),
        diisi_oleh: pengisi.trim(),
      },
      p_anggota,
    });
    setKirim(false);
    if (error)
      return toast.error(
        "Data belum terkirim. Periksa koneksi lalu coba lagi.",
      );
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
      <div className="mx-auto max-w-xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Data tersimpan</h1>
        <p className="text-muted-foreground">
          Terima kasih. Data keluarga {orang[0].nama_lengkap} sudah masuk ke
          database jemaat.
        </p>
        <div className="flex gap-2">
          <Link href="/" className={buttonVariants()}>
            Kembali ke Home
          </Link>
          <Button variant="outline" onClick={ulang}>
            Isi data keluarga lain
          </Button>
        </div>
      </div>
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
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Pilih anggota untuk diisi</h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi data setiap orang sampai 100%.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {orang.map((o) => {
            const p = persen(o);
            return (
              <button
                key={o.id}
                className="text-left"
                onClick={() => {
                  setAktifId(o.id);
                  setTahap("form");
                }}
              >
                <Card className="hover:bg-accent">
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{o.nama_lengkap}</span>
                      <Badge variant={p === 100 ? "default" : "secondary"}>
                        {o.kk
                          ? "Kepala Keluarga"
                          : o.status_keluarga || "Anggota"}
                      </Badge>
                    </div>
                    <Progress value={p} />
                    <p className="text-sm text-muted-foreground">{p}% terisi</p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={() => setTahap("keluarga")}>
            Kembali
          </Button>
          <div className="flex items-center gap-3">
            {!semua100 && (
              <span className="text-sm text-muted-foreground">
                Semua card harus 100%
              </span>
            )}
            <Button disabled={!semua100} onClick={() => setTahap("kirim")}>
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>
    );

  if (tahap === "kirim")
    return (
      <div className="mx-auto max-w-xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Kirim data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {orang.length} orang dari keluarga {orang[0].nama_lengkap} siap
              dikirim.
            </p>
            <div className="space-y-2">
              <Label>Nama Anda (yang mengisi form ini)</Label>
              <Input
                value={pengisi}
                onChange={(e) => setPengisi(e.target.value)}
              />
            </div>
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={setuju}
                onChange={(e) => setSetuju(e.target.checked)}
              />
              Saya menyetujui data ini disimpan dan digunakan untuk pendataan
              jemaat GPIB Ebenhaezer Palangka Raya.
            </label>
            <div className="flex justify-between">
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
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="mx-auto max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Data keluarga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama Kepala Keluarga</Label>
            <Input
              value={orang[0].nama_lengkap}
              onChange={(e) =>
                ubah(orang[0].id, { nama_lengkap: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Anggota keluarga (istri/suami, anak, cucu, famili)</Label>
            {orang.slice(1).map((o) => (
              <div key={o.id} className="flex gap-2">
                <Input
                  placeholder="Nama anggota"
                  value={o.nama_lengkap}
                  onChange={(e) => ubah(o.id, { nama_lengkap: e.target.value })}
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setOrang((l) => l.filter((x) => x.id !== o.id))
                  }
                >
                  Hapus
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setOrang((l) => [...l, baru()])}
            >
              Tambah anggota
            </Button>
          </div>
          <Button disabled={!namaOk} onClick={() => setTahap("pilih")}>
            Selanjutnya
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
