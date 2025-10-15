import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/user-menu";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const tApp = await getTranslations("app");
  const tAuth = await getTranslations("auth");

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div id="dashboard-sidebar-trigger" className="flex items-center"></div>
          <Link href="/" className="flex items-center gap-2">
            {/* You can swap this for a proper logo later */}
            <span className="text-base font-semibold tracking-tight">{tApp("name")}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          {!user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">{tAuth("login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">{tAuth("signup")}</Link>
              </Button>
            </>
          ) : (
            <UserMenu user={user} />
          )}
        </div>
      </div>
    </header>
  );
}
