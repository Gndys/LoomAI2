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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SocialButton } from "@/components/ui/social-button"

type FormData = z.infer<typeof loginFormSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false
    },
    mode: 'onBlur', // Enable validation on blur
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const { error } = await authClientReact.signIn.email(
        {
          email: data.email,
          password: data.password,
          callbackURL: '/',
          ...(data.remember ? { rememberMe: true } : {}),
        },
        {
          onRequest: (ctx) => {
            console.log('Sign in request started');
          },
          onSuccess: (ctx) => {
            console.log('Sign in successful', ctx);
            router.push('/dashboard');
          },
          onError: (ctx) => {
            setErrorMessage(ctx.error.message);
            console.error('Sign in failed:', ctx.error.message);
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your favorite social account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <SocialButton provider="google" />
                <SocialButton provider="github" />
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
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
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
