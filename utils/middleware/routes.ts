export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/trpc/");
}

export function isAiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/ai/");
}

export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/dashboard", "/admin"];
  return protectedRoutes.some((r) => pathname.startsWith(r));
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export function isAuthRoute(pathname: string): boolean {
  const authRoutes = ["/auth/login", "/auth/sign-up"];
  return authRoutes.some((r) => pathname.startsWith(r));
}
