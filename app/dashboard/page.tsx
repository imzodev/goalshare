import { auth, currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function DashboardPage() {
  // Server-side auth info
  const { userId } = await auth();
  const user = await currentUser();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      {!userId ? (
        <div className="rounded border p-4">
          <p className="mb-2">No has iniciado sesión.</p>
          <div className="flex gap-3">
            <Link className="underline" href="/sign-in">Iniciar sesión</Link>
            <Link className="underline" href="/sign-up">Crear cuenta</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Bienvenido</p>
          <div className="rounded border p-4">
            <div className="font-medium">{user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress}</div>
            <div className="text-sm text-muted-foreground">User ID: {userId}</div>
          </div>
        </div>
      )}
    </main>
  );
}
