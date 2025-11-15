import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch planId from profiles via Supabase REST (RLS must allow user to read own profile)
  let planId: string | undefined = undefined;
  if (user) {
    try {
      const { data } = await supabase
        .from("goalshare_profiles")
        .select("plan_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      planId = (data as any)?.plan_id as string | undefined;
    } catch {}
  }

  // Return response, user and planId for additional middleware logic
  return { supabaseResponse, user, planId };
}
