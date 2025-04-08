'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClientReact } from "@libs/auth/authClient";
import { loginFormSchema } from "@libs/validators/user";
import type { z } from "zod";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/ui/form-error"

type FormData = z.infer<typeof loginFormSchema>;

export function LoginForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true
    },
    mode: 'onBlur', // Enable validation on blur
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMessage('');
    setErrorCode('');

    const { error } = await authClientReact.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: '/',
        ...(data.remember ? { rememberMe: true } : {}),
      }
    );

    if (error) {
      if (error.code && error.message) {
        setErrorMessage(error.message);
        setErrorCode(error.code);
      } else {
        setErrorMessage('An unexpected error occurred');
        setErrorCode('UNKNOWN_ERROR');
      }
    }

    setLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <FormError message={errorMessage} code={errorCode} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="m@example.com"
                className={cn(errors.email && "border-destructive")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <span className="text-destructive text-xs absolute -bottom-5 left-0">
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={cn(errors.password && "border-destructive")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <span className="text-destructive text-xs absolute -bottom-5 left-0">
                  {errors.password.message}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              {...register('remember')}
              className="border-primary text-primary ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            />
            <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Remember me
            </label>
          </div>
          <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline underline-offset-4">
            Sign up
          </a>
        </div>
      </form>
    </div>
  );
}
