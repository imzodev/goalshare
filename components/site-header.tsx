"use client";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div id="dashboard-sidebar-trigger" className="flex items-center"></div>
          <Link href="/" className="flex items-center gap-2">
            {/* You can swap this for a proper logo later */}
            <span className="text-base font-semibold tracking-tight">GoalShare</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <Button asChild variant="outline" size="sm">
              <SignInButton>Iniciar sesión</SignInButton>
            </Button>
            <Button asChild size="sm">
              <SignUpButton>Crear cuenta</SignUpButton>
            </Button>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
