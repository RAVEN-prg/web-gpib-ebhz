import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-start justify-center gap-6 p-6 sm:p-8">
      <h1 className="text-balance text-4xl font-semibold tracking-tighter text-neutral-900 sm:text-5xl">
        Database Gereja GPIB Ebenhaezer Palangka Raya
      </h1>
      <p className="max-w-xl text-pretty text-base leading-relaxed text-neutral-500">
        Cukup satu Kepala Keluarga yang mengisi. Data istri atau suami, anak,
        dan anggota keluarga lain diisi dalam satu form.
      </p>
      <Link
        href="/isi-data"
        className={`${buttonVariants({ size: "lg" })} rounded-md bg-neutral-900 px-5 text-white shadow-none transition-all duration-200 hover:bg-neutral-700`}
      >
        Isi data keluarga saya
      </Link>
    </div>
  );
}
