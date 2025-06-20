'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import { Turnstile } from "@/components/ui/turnstile";
import { Loader2 } from "lucide-react";
import { forgetPasswordSchema } from "@libs/validators/user";
import { authClientReact } from '@libs/auth/authClient';
import type { z } from "zod";
import { useTranslation } from "@/hooks/use-translation";
import { config } from "@config";

type FormData = z.infer<typeof forgetPasswordSchema>;

export default function ForgetPasswordPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0); // 用于强制重新渲染 Turnstile

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    // 如果启用了 captcha 但没有 token，则提示用户
    if (config.captcha.enabled && !turnstileToken) {
      setError({
        code: "CAPTCHA_REQUIRED",
        message: t.auth.forgetPassword.errors.captchaRequired,
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authClientReact.forgetPassword({
        email: data.email,
        redirectTo: '/reset-password',
        fetchOptions: {
          headers: {
            'X-Locale': locale,
            ...(config.captcha.enabled && turnstileToken ? {
              "x-captcha-response": turnstileToken,
            } : {})
          }
        }
      });
      setEmailSent(true);
      setSentEmail(data.email);
    } catch (err: any) {
      setError({
        code: err.code || "UNKNOWN_ERROR",
        message: err.message || t.common.unexpectedError,
      });
      // 如果验证失败，重置 turnstile token 并强制重新渲染
      if (config.captcha.enabled) {
        setTurnstileToken(null);
        setTurnstileKey(prev => prev + 1); // 强制重新渲染 Turnstile 组件
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-[380px]">
      {!emailSent ? (
        <>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t.auth.forgetPassword.title}</CardTitle>
          <CardDescription>
            {t.auth.forgetPassword.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t.auth.forgetPassword.email}</Label>
                  <Input
                    id="email"
                    placeholder={t.auth.forgetPassword.emailPlaceholder}
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={loading}
                    {...register("email")}
                  />
                  {errors?.email && (
                    <p className="px-1 text-xs text-red-600">
                      {errors.email.type === 'required'
                        ? t.auth.forgetPassword.errors.requiredEmail
                        : t.auth.forgetPassword.errors.invalidEmail}
                    </p>
                  )}
                </div>

                {/* Cloudflare Turnstile 验证码 */}
                <Turnstile
                  key={turnstileKey}
                  onSuccess={(token: string) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />

                <Button disabled={loading || (config.captcha.enabled && !turnstileToken)}>
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loading ? t.auth.forgetPassword.submitting : t.auth.forgetPassword.submit}
                </Button>
              </div>
            </form>
          {error && <FormError message={error.message} code={error.code} />}
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            {t.auth.forgetPassword.termsNotice} <a href="#">{t.auth.forgetPassword.termsOfService}</a>{" "}
            {t.common.and} <a href="#">{t.auth.forgetPassword.privacyPolicy}</a>.
          </div>
        </CardContent>
        </>
      ) : (
        <div className="text-center space-y-4">
          <h3 className="font-medium">{t.auth.forgetPassword.verification.title}</h3>
          <p className="text-muted-foreground">
            {t.auth.forgetPassword.verification.sent} <span className="font-medium">{sentEmail}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            {t.auth.forgetPassword.verification.checkSpam}
          </p>
        </div>
      )}
    </Card>
  )
}
