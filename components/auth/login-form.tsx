"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/config/env";
import { getAuthErrorMessage } from "@/utils/auth-errors";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { useTranslations } from "next-intl";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const t = useTranslations("auth.loginPage");
  const tCommon = useTranslations("common.states");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(getAuthErrorMessage(error.message));
      setIsLoading(false);
    } else {
      toast.success(tCommon("success"));
      // Redirección al destino original si fue provisto por middleware
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirect = searchParams?.get("redirect");
      const safeRedirect = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
      router.push(safeRedirect);
      router.refresh();
    }
  }

  async function handleGithubSignIn() {
    try {
      setIsGithubLoading(true);
      const supabase = createClient();
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirect = searchParams?.get("redirect");
      const safeRedirect = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}${safeRedirect}`,
        },
      });
      if (error) {
        toast.error(getAuthErrorMessage(error.message));
        setIsGithubLoading(false);
      }
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : tCommon("error");
      toast.error(getAuthErrorMessage(msg));
      setIsGithubLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true);
      const supabase = createClient();
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirect = searchParams?.get("redirect");
      const safeRedirect = redirect && redirect.startsWith("/") ? redirect : "/dashboard";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}${safeRedirect}`,
        },
      });
      if (error) {
        toast.error(getAuthErrorMessage(error.message));
        setIsGoogleLoading(false);
      }
      // On success, Supabase will redirect; no need to continue here.
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : tCommon("error");
      toast.error(getAuthErrorMessage(msg));
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border border-border bg-card shadow-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-3xl font-semibold text-foreground">{t("title")}</CardTitle>
        <CardDescription className="text-center text-muted-foreground">{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("password")}</Label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                {t("forgotPassword")}
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              required
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon("loading")}
              </>
            ) : (
              t("submit")
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t("orContinueWith")}</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
              </>
            ) : (
              <>
                <FaGoogle className="mr-2 h-4 w-4" /> Google
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGithubSignIn}
            disabled={isLoading || isGithubLoading}
          >
            {isGithubLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {tCommon("loading")}
              </>
            ) : (
              <>
                <FaGithub className="mr-2 h-4 w-4" /> GitHub
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t("noAccount")}{" "}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
            {t("signupLink")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
