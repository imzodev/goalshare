/**
 * Test wrapper for components that use next-intl
 * Provides NextIntlClientProvider context for testing
 */

import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import esMessages from "@/i18n/messages/es.json";
import enMessages from "@/i18n/messages/en.json";

interface I18nTestWrapperProps {
  children: ReactNode;
  locale?: "es" | "en";
}

/**
 * Wrapper component for testing components that use useTranslations
 *
 * Usage:
 * ```tsx
 * render(
 *   <I18nTestWrapper>
 *     <YourComponent />
 *   </I18nTestWrapper>
 * );
 * ```
 */
export function I18nTestWrapper({ children, locale = "es" }: I18nTestWrapperProps) {
  const messages = locale === "es" ? esMessages : enMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Helper function to wrap a component with I18nTestWrapper
 *
 * Usage:
 * ```tsx
 * const { getByText } = render(withI18n(<YourComponent />));
 * ```
 */
export function withI18n(component: ReactNode, locale: "es" | "en" = "es") {
  return <I18nTestWrapper locale={locale}>{component}</I18nTestWrapper>;
}
