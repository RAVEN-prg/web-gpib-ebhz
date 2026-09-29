"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aktif, terisi, kosong } from "@/lib/validasi";

export default function FormAnggota({ orang, kk, ubah, selesai }) {
  const [cek, setCek] = useState(false);
  const daftar = aktif(orang);
  const merah = (f) => (cek && !terisi(f, orang) ? "border-destructive" : "");

  const salin = () => {
    const s = {};
    ["alamat", "sektor", "masa_tinggal"].forEach((k) => kk[k] && (s[k] = kk[k]));
    ubah(s);
  };
  const lanjut = () => {
    if (daftar.every((f) => terisi(f, orang))) return selesai();
    setCek(true);
    toast.error("Masih ada kolom yang belum diisi.");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{orang.nama_lengkap}</h1>
        <p className="text-sm text-muted-foreground">Semua kolom wajib diisi. Isi "-" jika tidak ada.</p>
      </div>
      {!orang.kk && (
        <Button variant="outline" size="sm" onClick={salin}>
          Samakan alamat, sektor, dan lama tinggal dengan Kepala Keluarga
        </Button>
      )}
      {daftar.map((f) => (
        <div key={f.k} className="space-y-2">
          <Label>{f.label}</Label>
          {f.t === "select" ? (
            <Select value={orang[f.k] || ""} onValueChange={(v) => ubah({ [f.k]: v })}>
              <SelectTrigger className={`w-full ${merah(f)}`}><SelectValue placeholder="Pilih" /></SelectTrigger>
              <SelectContent>
                {f.o.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : f.t === "area" ? (
            <Textarea className={merah(f)} value={orang[f.k] || ""} onChange={(e) => ubah({ [f.k]: e.target.value })} />
          ) : (
            <Input type={f.t} className={merah(f)} value={orang[f.k] || ""} onChange={(e) => ubah({ [f.k]: e.target.value })} />
          )}
          {f.lain && orang[f.k] === "Lainnya" && (
            <Input
              placeholder="Sebutkan"
              className={cek && kosong(orang[f.lain]) ? "border-destructive" : ""}
              value={orang[f.lain] || ""}
              onChange={(e) => ubah({ [f.lain]: e.target.value })}
            />
          )}
          {f.nol && (
            <Button type="button" variant="ghost" size="sm" onClick={() => ubah({ [f.k]: "-" })}>
              Tidak ada / -
            </Button>
          )}
        </div>
      ))}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={selesai}>Kembali ke daftar</Button>
        <Button onClick={lanjut}>Selanjutnya</Button>
      </div>
    </div>
  );
}
