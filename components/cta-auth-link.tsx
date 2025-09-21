"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function CtaAuthLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <SignedIn>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90 transition"
        >
          {children}
        </Link>
      </SignedIn>
      <SignedOut>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:opacity-90 transition"
        >
          {children}
        </Link>
      </SignedOut>
    </div>
  );
}
