"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/config/env";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { getAuthErrorMessage } from "@/utils/auth-errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { FaGoogle, FaGithub } from "react-icons/fa6";
import { useTranslations } from "next-intl";

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const t = useTranslations("auth.signupPage");
  const tValidation = useTranslations("validation");
  const tCommon = useTranslations("common.states");
  const tErrors = useTranslations("auth.errors");

  const signUpSchema = z
    .object({
      email: z.string().email(tValidation("email")),
      password: z.string().min(6, tValidation("minLength", { min: 6 })),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tErrors("passwordMismatch"),
      path: ["confirmPassword"],
    });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validación de email y contraseñas con Zod
    const result = signUpSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const message = result.error.issues?.[0]?.message || tValidation("required");
      toast.error(message);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/confirm`,
      },
    });

    if (error) {
      toast.error(getAuthErrorMessage(error.message));
      setIsLoading(false);
    } else {
      toast.success(tCommon("success"), {
        description: t("emailConfirmation"),
      });
      router.push("/auth/sign-up-success");
    }
  }

  async function handleGithubSignUp() {
    try {
      setIsGithubLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      });
      if (error) {
        toast.error(getAuthErrorMessage(error.message));
        setIsGithubLoading(false);
      }
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(getAuthErrorMessage(msg));
      setIsGithubLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    try {
      setIsGoogleLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${env.NEXT_PUBLIC_APP_URL}/dashboard`,
        },
      });
      if (error) {
        toast.error(getAuthErrorMessage(error.message));
        setIsGoogleLoading(false);
      }
      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
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
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder={t("confirmPasswordPlaceholder")}
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
            onClick={handleGoogleSignUp}
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
            onClick={handleGithubSignUp}
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
          {t("hasAccount")}{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            {t("loginLink")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
