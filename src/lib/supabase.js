import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

const { error } = await supabase.rpc("submit_keluarga", {
  p_keluarga: { nama_kepala_keluarga, diisi_oleh },
  p_anggota: daftarAnggota, // array, KK ada di dalamnya
});
