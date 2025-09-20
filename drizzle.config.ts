import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // Recomendado: usar la URL de conexión de Supabase para migraciones locales
    // Usa la URL de servicio (Service Role) SOLO en entorno local/CI y nunca en el navegador.
    url: process.env.SUPABASE_DB_URL as string,
  },
});
