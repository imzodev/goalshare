export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/trpc/");
}

export function isAiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/ai/");
}

export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/dashboard"];
  return protectedRoutes.some((r) => pathname.startsWith(r));
}

export function isAuthRoute(pathname: string): boolean {
  const authRoutes = ["/auth/login", "/auth/sign-up"];
  return authRoutes.some((r) => pathname.startsWith(r));
}
