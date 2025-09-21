import { createClient } from "@supabase/supabase-js";

// Client (browser) – usa las variables públicas
export const supabaseBrowser = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    // Evitar fallos silenciosos durante el dev
    console.warn("[supabaseBrowser] NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no definidas.");
  }
  return createClient(url ?? "", anonKey ?? "");
})();

// Server – en la mayoría de casos, también se usa el anon key.
// Si en algún flujo admin requieres Service Role, se debe leer SOLO en server
// y nunca exponerlo al cliente.
export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.warn("[supabaseServer] NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no definidas.");
  }
  return createClient(url ?? "", anonKey ?? "");
}
