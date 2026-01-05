import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";

export async function AdminHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center gap-2">
        <h2 className="text-sm font-semibold">Admin Panel</h2>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && <UserMenu user={user} />}
      </div>
    </header>
  );
}
