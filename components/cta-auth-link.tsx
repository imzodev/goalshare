import Link from "next/link";
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
  // This component is used on the landing page which already checks auth
  // So we can just link to sign-up for unauthenticated users
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href="/auth/sign-up">{children}</Link>
    </Button>
  );
}
