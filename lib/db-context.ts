import { db, client } from "@/db";

/**
 * withUserContext: setea app.user_id en la conexión Postgres para que RLS funcione por usuario (Clerk).
 * Usa Clerk user id (profiles.user_id) y ejecuta la operación proporcionada.
 */
export async function withUserContext<T>(clerkUserId: string, fn: (dbInstance: typeof db) => Promise<T>): Promise<T> {
  // Setea el contexto por conexión. 'true' mantiene la variable durante la sesión.
  // Opción A: usando postgres-js client directamente
  await client`select set_config('app.user_id', ${clerkUserId}, true)`;

  // Opción B (alternativa): usando Drizzle + sql tag
  // await db.execute(sql`select set_config('app.user_id', ${clerkUserId}, true)`);

  return fn(db);
}

/**
 * setUserContext: helper simple si solo quieres fijar el contexto sin ejecutar una función.
 */
export async function setUserContext(clerkUserId: string): Promise<void> {
  await client`select set_config('app.user_id', ${clerkUserId}, true)`;
}
