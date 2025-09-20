import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Nota: Usa SOLO en el servidor (server actions, route handlers, etc.).
// Requiere que SUPABASE_DB_URL esté definida en .env.local (URL de conexión a Postgres de Supabase).
// En Supabase, habilita SSL (require) para conexiones externas.
const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  // Evitar fallos silenciosos durante el desarrollo
  console.warn(
    "[db] Variable de entorno SUPABASE_DB_URL no definida. Define esta variable en .env.local"
  );
}

export const client = postgres(connectionString as string, {
  ssl: "require",
  max: 1, // Conexión ligera para serverless; ajusta si usas funciones largas o jobs
});

export const db = drizzle(client);
