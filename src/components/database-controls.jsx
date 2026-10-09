"use client";

import { Filter, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PILIHAN_FILTER } from "@/lib/filter-jemaat";

const KONTROL =
  "h-10 border-neutral-200 bg-white shadow-none transition-all duration-200 hover:border-neutral-400 focus-visible:border-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-900/10";

export default function DatabaseControls({
  cari,
  setCari,
  hanyaKepala,
  setHanyaKepala,
  filters,
  setFilters,
  filterTerbuka,
  setFilterTerbuka,
}) {
  const jumlahAktif = filters.filter((filter) => filter.nilai).length;

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input
            className={`pl-9 ${KONTROL}`}
            placeholder="Cari nama, pelkat, peran, sektor, atau kepala keluarga"
            value={cari}
            onChange={(event) => setCari(event.target.value)}
          />
        </div>
        <Button
          type="button"
          variant={hanyaKepala ? "default" : "outline"}
          className="h-10 shrink-0"
          aria-pressed={hanyaKepala}
          onClick={() => {
            setHanyaKepala((aktif) => !aktif);
          }}
        >
          Kepala keluarga
        </Button>
        <Button
          type="button"
          variant={filterTerbuka || jumlahAktif ? "default" : "outline"}
          className="h-10 shrink-0"
          aria-expanded={filterTerbuka}
          onClick={() => setFilterTerbuka((terbuka) => !terbuka)}
        >
          <Filter className="size-4" />
          Filter{jumlahAktif ? ` (${jumlahAktif})` : ""}
        </Button>
      </div>

      {filterTerbuka && (
        <section
          className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4"
          aria-label="Filter database jemaat"
        >
          {filters.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Tambahkan kolom untuk mulai memfilter data.
            </p>
          ) : (
            <div className="space-y-2">
              {filters.map((filter, index) => {
                const pilihan = PILIHAN_FILTER.find(
                  (item) => item.kolom === filter.kolom,
                );
                const kolomTersedia = PILIHAN_FILTER.filter(
                  (item) =>
                    item.kolom === filter.kolom ||
                    !filters.some(
                      (lain, i) => i !== index && lain.kolom === item.kolom,
                    ),
                );

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]"
                  >
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
              onClick={() =>
                setFilters((sebelumnya) => [
                  ...sebelumnya,
                  { kolom: "", nilai: "" },
                ])
              }
            >
              <Plus className="size-4" />
              Tambah filter
            </Button>
            {filters.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFilters([])}
              >
                Hapus semua
              </Button>
            )}
          </div>
        </section>
      )}
    </>
  );
}
