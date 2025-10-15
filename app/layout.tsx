import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { env } from "@/config/env";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: {
    default: "GoalShare — Comparte y cumple tus objetivos",
    template: "%s — GoalShare",
  },
  description:
    "Organiza metas, comparte tu progreso y logra resultados con el apoyo de tu comunidad. Defines objetivos, haces seguimiento y recibes feedback.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "GoalShare",
    title: "GoalShare — Comparte y cumple tus objetivos",
    description: "Organiza metas, comparte tu progreso y logra resultados con el apoyo de tu comunidad.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "GoalShare" }],
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "GoalShare — Comparte y cumple tus objetivos",
    description: "Organiza metas, comparte tu progreso y logra resultados con el apoyo de tu comunidad.",
    images: ["/og.svg"],
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("app");

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:text-foreground focus:px-3 focus:py-2 focus:shadow"
            >
              {t("skipToContent")}
            </a>
            <SiteHeader />
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
