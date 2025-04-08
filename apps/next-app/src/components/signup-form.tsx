'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClientReact } from "@libs/auth/authClient";
import { signupFormSchema } from "@libs/validators/user";
import type { z } from "zod";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/ui/form-error"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Inbox } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import Link from "next/link"

type FormData = z.infer<typeof signupFormSchema>;

export function SignupForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isVerificationEmailSent, setIsVerificationEmailSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      password: '12345678',
      name: '',
      image: ''
    },
    mode: 'onBlur', // Enable validation on blur
  });

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setErrorMessage('');
    setErrorCode('');
    
    const { error, data } = await authClientReact.signUp.email(
      {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        image: formData.image || undefined,
      }
    );

    if (error) {
      if (error.code && error.message) {
        setErrorMessage(error.message);
        setErrorCode(error.code);
      } else {
        setErrorMessage(t.common.unexpectedError);
        setErrorCode('UNKNOWN_ERROR');
      }
      setLoading(false);
      return;
    }

    console.log('Sign up successful', data);
    const { error: verificationError } = await authClientReact.sendVerificationEmail({
      email: formData.email,
      callbackURL: "/" // The redirect URL after verification
    });

    if (verificationError) {
      if (verificationError.code && verificationError.message) {
        setErrorMessage(verificationError.message);
        setErrorCode(verificationError.code);
      } else {
        setErrorMessage(t.common.unexpectedError);
        setErrorCode('UNKNOWN_ERROR');
      }
    } else {
      setVerificationEmail(formData.email);
      setIsVerificationEmailSent(true);
    }
    
    setLoading(false);
  };

  if (isVerificationEmailSent) {
    return (
      <div className={cn("flex flex-col gap-4", className)} {...props}>
        <Alert className="my-4">
          <Inbox className="h-4 w-4" />
          <AlertTitle>{t.auth.signup.verification.title}</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">
              {t.auth.signup.verification.sent} <strong>{verificationEmail}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              {t.auth.signup.verification.checkSpam}{" "}
              {t.auth.signup.verification.spamInstruction}{" "}
              <button 
                onClick={() => setIsVerificationEmailSent(false)} 
                className="text-primary underline underline-offset-4 hover:text-primary/90"
              >
                {t.actions.tryAgain}
              </button>
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <FormError message={errorMessage} code={errorCode} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">{t.auth.signup.name}</Label>
            <div className="relative">
              <Input
                id="name"
                type="text"
                {...register('name')}
                placeholder={t.auth.signup.namePlaceholder}
                className={cn(errors.name && "border-destructive")}
                aria-invalid={errors.name ? "true" : "false"}
              />
              {errors.name && (
                <span className="text-destructive text-xs absolute -bottom-5 left-0">
                  {errors.name.type === 'required' 
                    ? t.auth.signup.errors.requiredName 
                    : t.auth.signup.errors.invalidName}
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t.auth.signup.email}</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder={t.auth.signup.emailPlaceholder}
                className={cn(errors.email && "border-destructive")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <span className="text-destructive text-xs absolute -bottom-5 left-0">
                  {errors.email.type === 'required' 
                    ? t.auth.signup.errors.requiredEmail 
                    : t.auth.signup.errors.invalidEmail}
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t.auth.signup.password}</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder={t.auth.signup.passwordPlaceholder}
                className={cn(errors.password && "border-destructive")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <span className="text-destructive text-xs absolute -bottom-5 left-0">
                  {errors.password.type === 'required' 
                    ? t.auth.signup.errors.requiredPassword 
                    : t.auth.signup.errors.invalidPassword}
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">
              {t.auth.signup.imageUrl} ({t.auth.signup.optional})
            </Label>
            <div className="relative">
              <Input
                id="image"
                type="url"
                {...register('image')}
                placeholder={t.auth.signup.imageUrlPlaceholder}
                className={cn(errors.image && "border-destructive")}
                aria-invalid={errors.image ? "true" : "false"}
              />
              {errors.image && (
                <span className="text-destructive text-xs absolute -bottom-5 left-0">
                  {t.auth.signup.errors.invalidImage}
                </span>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
            {loading ? t.auth.signup.submitting : t.auth.signup.submit}
          </Button>
        </div>
        <div className="text-center text-sm">
          {t.auth.signup.haveAccount}{" "}
          <Link href={`/${locale}/signin`} className="text-primary hover:underline underline-offset-4">
            {t.auth.signup.signinLink}
          </Link>
        </div>
      </form>
    </div>
  );
} 