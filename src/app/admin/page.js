"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, LogOut, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import FormAnggota from "@/components/form-anggota";
import DatabaseControls from "@/components/database-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { cocokAnggota, peranOf, pilih } from "@/lib/filter-jemaat";
import { FIELDS } from "@/lib/validasi";

export default function Admin() {
  const [status, setStatus] = useState("checking");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [masuk, setMasuk] = useState(false);
  const [anggota, setAnggota] = useState([]);
  const [mengedit, setMengedit] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false);
  const [cari, setCari] = useState("");
  const [hanyaKepala, setHanyaKepala] = useState(false);
  const [keluargaTerbuka, setKeluargaTerbuka] = useState(() => new Set());
  const [filterTerbuka, setFilterTerbuka] = useState(false);
  const [filters, setFilters] = useState([]);

  const muatAnggota = useCallback(async () => {
    const { data, error } = await supabase
      .from("anggota")
      .select("*, keluarga(id, nama_kepala_keluarga)")
      .order("nama_lengkap");
    if (error) {
      toast.error("Data admin gagal dimuat. Periksa kebijakan database.");
      return false;
    }
    setAnggota(data || []);
    return true;
  }, []);

  const cekAkses = useCallback(
    async (user) => {
      if (!user) {
        setStatus("login");
        return;
      }
      setStatus("checking");
      const { data: admin, error } = await supabase.rpc("is_admin");
      if (error) {
        setStatus("setup-error");
        return;
      }
      if (!admin) {
        setStatus("denied");
        return;
      }
      await muatAnggota();
      setStatus("admin");
    },
    [muatAnggota],
  );

  const hasil = useMemo(
    () => anggota.filter((orang) => cocokAnggota(orang, cari, filters)),
    [anggota, cari, filters],
  );

  const barisTampil = useMemo(() => {
    if (!hanyaKepala) return hasil.map((a) => ({ a }));

    const keluargaCocok = new Set(hasil.map((a) => a.keluarga_id));
    const kepala = anggota.filter(
      (a) => a.is_kepala_keluarga && keluargaCocok.has(a.keluarga_id),
    );
    return kepala.flatMap((a) => {
      const anak = anggota.filter(
        (orang) =>
          orang.keluarga_id === a.keluarga_id &&
          !orang.is_kepala_keluarga &&
          hasil.some((cocok) => cocok.id === orang.id),
      );
      return [
        { a, anggota: anak },
        ...(keluargaTerbuka.has(a.keluarga_id)
          ? anak.map((orang) => ({ a: orang, anak: true }))
          : []),
      ];
    });
  }, [anggota, hasil, hanyaKepala, keluargaTerbuka]);

  useEffect(() => {
    let hidup = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (hidup) await cekAkses(error ? null : data.user);
    })();
    return () => {
      hidup = false;
    };
  }, [cekAkses]);

  async function login(event) {
    event.preventDefault();
    setMasuk(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username.trim(),
      password,
    });
    setMasuk(false);
    if (error) {
      toast.error("Username atau password tidak sesuai.");
      return;
    }
    setPassword("");
    await cekAkses(data.user);
  }

  async function logout() {
    await supabase.auth.signOut();
    setStatus("login");
    setAnggota([]);
    setMengedit(null);
  }

  async function simpanPerubahan() {
    if (!mengedit) return;
    setMenyimpan(true);
    const payload = Object.fromEntries(
      FIELDS.filter((field) => !field.ada || !field.ada(mengedit)).flatMap(
        (field) =>
          field.lain ? [field.k, field.lain].map((key) => [key, mengedit[key] || null]) : [[field.k, mengedit[field.k] || null]],
      ),
    );

    const namaLama = mengedit.keluarga?.nama_kepala_keluarga;
    if (mengedit.is_kepala_keluarga && namaLama !== mengedit.nama_lengkap) {
      const { error } = await supabase
        .from("keluarga")
        .update({ nama_kepala_keluarga: mengedit.nama_lengkap.trim() })
        .eq("id", mengedit.keluarga_id);
      if (error) {
        setMenyimpan(false);
        toast.error("Nama kepala keluarga gagal diperbarui.");
        return;
      }
    }

    const { error } = await supabase
      .from("anggota")
      .update(payload)
      .eq("id", mengedit.id);
    if (error) {
      if (mengedit.is_kepala_keluarga && namaLama !== mengedit.nama_lengkap) {
        await supabase
          .from("keluarga")
          .update({ nama_kepala_keluarga: namaLama })
          .eq("id", mengedit.keluarga_id);
      }
      setMenyimpan(false);
      toast.error("Perubahan gagal disimpan. Data belum diubah.");
      return;
    }

    await muatAnggota();
    setMenyimpan(false);
    setMengedit(null);
    toast.success("Perubahan data berhasil disimpan.");
  }

  async function hapusAnggota(orang) {
    if (
      !window.confirm(
        `Hapus data ${orang.nama_lengkap}? Tindakan ini tidak dapat dibatalkan.`,
      )
    ) {
      return;
    }

    if (orang.is_kepala_keluarga) {
      const { data: satuKeluarga, error: cekError } = await supabase
        .from("anggota")
        .select("id")
        .eq("keluarga_id", orang.keluarga_id);
      if (cekError) return toast.error("Anggota keluarga gagal diperiksa.");
      if (satuKeluarga.length > 1) {
        return toast.error(
          "Hapus anggota keluarga lainnya terlebih dahulu sebelum menghapus kepala keluarga.",
        );
      }
    }

    const { error } = await supabase.from("anggota").delete().eq("id", orang.id);
    if (error) return toast.error("Data gagal dihapus. Periksa izin admin.");

    const { data: anggotaTersisa, error: sisaError } = await supabase
      .from("anggota")
      .select("id")
      .eq("keluarga_id", orang.keluarga_id);
    if (sisaError) {
      await muatAnggota();
      return toast.error("Data orang terhapus, tetapi sisa anggota keluarga gagal diperiksa.");
    }
    if (anggotaTersisa.length === 0) {
      const { error: keluargaError } = await supabase
        .from("keluarga")
        .delete()
        .eq("id", orang.keluarga_id);
      if (keluargaError) {
        await muatAnggota();
        return toast.error("Data orang terhapus, tetapi data keluarganya belum terhapus.");
      }
    }
    setAnggota((sebelumnya) => sebelumnya.filter((item) => item.id !== orang.id));
    toast.success("Data berhasil dihapus.");
  }

  if (status === "checking") {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 p-4 sm:p-8">
        <Skeleton className="h-8 w-48 bg-neutral-100" />
        <Skeleton className="h-24 w-full bg-neutral-100" />
      </div>
    );
  }

  if (status === "setup-error") {
    return (
      <div className="mx-auto w-full max-w-xl space-y-3 p-4 sm:p-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Admin belum disiapkan</h1>
        <p className="text-sm leading-relaxed text-neutral-600">
          Jalankan skrip <code>sql/admin.sql</code> di Supabase SQL Editor, lalu
          tambahkan UUID akun admin ke tabel <code>admin_users</code>.
        </p>
      </div>
    );
  }

  if (status === "login" || status === "denied") {
    return (
      <div className="mx-auto w-full max-w-md space-y-6 p-4 pt-10 sm:p-8 sm:pt-16">
        <div className="flex size-11 items-center justify-center rounded-xl border border-neutral-200 bg-white">
          <ShieldCheck className="size-5 text-neutral-700" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Login admin</h1>
          <p className="text-sm text-neutral-500">
            {status === "denied"
              ? "Akun ini belum diberi izin admin. Hubungi pengelola database."
              : "Masuk dengan akun admin yang sudah dibuat di Supabase."}
          </p>
        </div>
        {status === "login" && (
          <form className="space-y-4" onSubmit={login}>
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username (email akun)</Label>
              <Input
                id="admin-username"
                type="email"
                autoComplete="username"
                required
                className={KONTROL}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                className={KONTROL}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={masuk}>
              {masuk ? "Memeriksa..." : "Masuk"}
            </Button>
          </form>
        )}
        {status === "denied" && (
          <Button type="button" variant="outline" onClick={logout}>
            <LogOut className="size-4" />
            Keluar dari akun
          </Button>
        )}
      </div>
    );
  }

  if (mengedit) {
    return (
      <div className="mx-auto w-full max-w-3xl p-2 sm:p-6">
        <FormAnggota
          orang={mengedit}
          kk={{}}
          ubah={(patch) => setMengedit((sebelumnya) => ({ ...sebelumnya, ...patch }))}
          kembali={() => setMengedit(null)}
          selesai={simpanPerubahan}
          tombolSelesai={menyimpan ? "Menyimpan..." : "Simpan perubahan"}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Kelola data jemaat</h1>
          <p className="text-sm tabular-nums text-neutral-500">
            {hanyaKepala
              ? `${barisTampil.filter((baris) => !baris.anak).length} keluarga dari ${anggota.length} orang`
              : `${hasil.length} dari ${anggota.length} orang`}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={logout}>
          <LogOut className="size-4" />
          Keluar
        </Button>
      </div>

      <DatabaseControls
        cari={cari}
        setCari={setCari}
        hanyaKepala={hanyaKepala}
        setHanyaKepala={(pembaruan) => {
          setHanyaKepala(pembaruan);
          setKeluargaTerbuka(new Set());
        }}
        filters={filters}
        setFilters={setFilters}
        filterTerbuka={filterTerbuka}
        setFilterTerbuka={setFilterTerbuka}
      />

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
            {barisTampil.map(({ a, anggota: anak = [], anak: adalahAnak = false }) => (
              <tr
                key={a.id}
                className={`transition-colors duration-200 hover:bg-neutral-50 ${adalahAnak ? "bg-neutral-50/70" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {hanyaKepala && !adalahAnak && anak.length > 0 ? (
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
                    ) : hanyaKepala && !adalahAnak ? (
                      <span className="size-8 shrink-0" />
                    ) : null}
                    <div className={adalahAnak ? "pl-2" : ""}>
                      <div className={`font-medium ${adalahAnak ? "text-neutral-700" : "text-neutral-900"}`}>
                        {a.nama_lengkap}
                      </div>
                      {adalahAnak ? (
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
                <td className="space-x-1 px-4 py-3 text-right">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMengedit({ ...a, kk: a.is_kepala_keluarga })}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => hapusAnggota(a)}
                  >
                    <Trash2 className="size-3.5" />
                    Hapus
                  </Button>
                </td>
              </tr>
            ))}
            {barisTampil.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-neutral-500">
                  {cari
                    ? `Tidak ada hasil untuk "${cari}".`
                    : filters.some((filter) => filter.nilai)
                      ? "Tidak ada data yang cocok dengan filter."
                      : "Belum ada data jemaat."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
