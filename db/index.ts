import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

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
  max: 10, // Pool de conexiones para manejar requests concurrentes
  idle_timeout: 20, // Cerrar conexiones inactivas después de 20 segundos
  max_lifetime: 60 * 30, // Máximo tiempo de vida de una conexión: 30 minutos
});

export const db = drizzle(client, { schema });
