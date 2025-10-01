"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function CtaAuthLink({
  children,
  className,
  variant = "default",
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  return (
    <div className={className}>
      <SignedIn>
        <Button asChild variant={variant} size={size}>
          <Link href="/dashboard">{children}</Link>
        </Button>
      </SignedIn>
      <SignedOut>
        <Button asChild variant={variant} size={size}>
          <Link href="/sign-in">{children}</Link>
        </Button>
      </SignedOut>
    </div>
  );
}
