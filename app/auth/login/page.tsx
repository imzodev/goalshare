import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative bg-background">
      {/* Mobile background image (full page) */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src="/images/auth/login-hero.png"
          alt="Tu viaje de metas comienza aquí"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content grid: centers the form without wrapping it in another div */}
      <div className="relative z-10 grid min-h-screen place-items-center p-4 md:min-h-[calc(100dvh-58px)] md:grid-cols-2 md:p-0 md:overflow-hidden">
        {/* Left column: the form itself (no extra wrapper) */}
        <LoginForm />

        {/* Right: illustrative image only on md+ */}
        <div className="relative hidden h-full w-full md:block">
          <Image
            src="/images/auth/login-hero.png"
            alt="Tu viaje de metas comienza aquí"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-sm">
            <h3 className="text-2xl font-semibold sm:text-3xl">Plan Your Goals</h3>
            <p className="mt-1 text-sm text-white/80">Organiza, colabora y logra tus metas con claridad.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
