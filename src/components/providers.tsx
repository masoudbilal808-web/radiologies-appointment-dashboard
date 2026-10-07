import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/features/auth/auth-provider";
import { ToastProvider } from "@/components/ui/toast";

interface ProvidersProps {
  locale: string;
  children: ReactNode;
}

export function Providers({ locale, children }: ProvidersProps) {
  return (
    <NextIntlClientProvider locale={locale}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
