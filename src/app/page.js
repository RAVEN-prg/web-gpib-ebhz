import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-3.5rem)] overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="home-glow home-glow-one absolute -right-24 -top-28 size-96 rounded-full bg-emerald-200/40 blur-3xl sm:right-8 sm:top-0" />
        <div className="home-glow home-glow-two absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-amber-100/60 blur-3xl" />
        <div className="home-orbit absolute right-[12%] top-[18%] size-44 rounded-full border border-emerald-900/10 sm:size-64">
          <div className="absolute -right-1 top-1/2 size-3 rounded-full bg-emerald-600/50 shadow-[0_0_24px_8px_rgba(5,150,105,0.12)]" />
          <div className="absolute bottom-[14%] left-[12%] size-2 rounded-full bg-amber-500/60" />
        </div>
        <div className="home-orbit home-orbit-delayed absolute right-[18%] top-[24%] size-32 rounded-full border border-amber-900/10 sm:size-48" />
        <div className="home-speck home-speck-one absolute right-[38%] top-[18%] size-2 rounded-full bg-emerald-500/40" />
        <div className="home-speck home-speck-two absolute right-[10%] top-[62%] size-1.5 rounded-full bg-amber-500/50" />
        <div className="home-speck home-speck-three absolute left-[12%] top-[70%] size-2 rounded-full bg-emerald-600/30" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 z-0 h-[46%] w-[72%] sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[54%]">
        <Image
          src="/gereja.png"
          alt=""
          width={1080}
          height={1350}
          preload
          className="h-full w-full translate-y-4 object-contain object-bottom sm:translate-y-6 sm:object-right-bottom"
        />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3.5rem)] w-full max-w-6xl flex-col items-start justify-center gap-6 p-6 pb-[43svh] sm:pb-8 sm:pr-[48%] sm:pl-8">
        <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tighter text-neutral-900 sm:text-5xl">
          Database Gereja GPIB Ebenhaezer Palangka Raya
        </h1>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-neutral-600">
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
    </section>
  );
}
