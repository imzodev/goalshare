import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/constants";

/**
 * Server-side version of admin check for use in Layouts and Pages.
 * Throws a redirect if not an admin.
 */
export async function validateAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.AUTH_LOGIN);
  }

  const isUserAdmin = await isAdmin(user.id);

  if (!isUserAdmin) {
    redirect(ROUTES.DASHBOARD);
  }

  return user;
}
