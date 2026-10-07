"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { useAuth } from "./auth-provider";
import { getApiErrorMessage, mapApiErrorToKey } from "@/lib/api/errors";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

interface FieldErrors {
  username?: string;
  password?: string;
}

export function LoginForm() {
  const t = useTranslations();
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!username.trim()) {
      next.username = t("Validation.required");
    } else if (username.trim().length < 3) {
      next.username = t("Validation.usernameMin");
    }
    if (!password) {
      next.password = t("Validation.required");
    } else if (password.length < 6) {
      next.password = t("Validation.passwordMin");
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      router.replace("/dashboard");
    } catch (error) {
      const key = mapApiErrorToKey(error);
      const fallback = getApiErrorMessage(error);
      let message: string;
      if (key) {
        message = t(`ApiErrors.${key}`);
      } else if (fallback === "networkError" || fallback === "genericError") {
        message = t(`ApiErrors.${fallback}`);
      } else {
        message = t("ApiErrors.serverMessage", { message: fallback });
      }
      toast.create({
        type: "error",
        title: t("Toasts.error"),
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="username">{t("Auth.username")}</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          aria-invalid={Boolean(errors.username)}
          aria-describedby={errors.username ? "username-error" : undefined}
          placeholder={t("Auth.usernamePlaceholder")}
        />
        {errors.username ? (
          <p id="username-error" className="text-sm text-destructive" role="alert">
            {errors.username}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("Auth.password")}</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className="pe-10"
            placeholder={t("Auth.passwordPlaceholder")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={
              showPassword ? t("Auth.hidePassword") : t("Auth.showPassword")
            }
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password ? (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {errors.password}
          </p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {t("Auth.signIn")}
      </Button>
    </form>
  );
}
