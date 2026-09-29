import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-start justify-center gap-6 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">Database Gereja GPIB Ebenhaezer Palangka Raya</h1>
      <p className="text-muted-foreground">
        Cukup satu Kepala Keluarga yang mengisi. Data istri atau suami, anak, dan anggota keluarga lain diisi dalam satu form.
      </p>
      <Link href="/isi-data" className={buttonVariants({ size: "lg" })}>Isi data keluarga saya</Link>
    </div>
  );
}
