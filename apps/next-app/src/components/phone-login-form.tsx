'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { authClientReact } from '@libs/auth/authClient'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormError } from "@/components/ui/form-error"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Loader2 } from "lucide-react"
import { phoneLoginSchema, phoneVerifySchema } from "@libs/validators/user"
import type { z } from "zod"

type FormData = z.infer<typeof phoneLoginSchema>;
type VerifyData = z.infer<typeof phoneVerifySchema>;

export function PhoneLoginForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(phoneLoginSchema),
  });

  const phoneNumber = watch("phone");

  const onSubmitPhone = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);
      await authClientReact.phoneNumber.sendOtp({
        phoneNumber: data.phone
      })
      setOtpSent(true);
    } catch (err: any) {
      setError({
        code: err.code || "UNKNOWN_ERROR",
        message: err.message || "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async () => {
    if (otp.length !== 6) return;
    try {
      setLoading(true);
      setError(null);
      const isVerified = await authClientReact.phoneNumber.verify({
        phoneNumber,
        code: otp
      })
      console.log('isVerified', isVerified)
      if (isVerified) {
        router.push("/");
      }
    } catch (err: any) {
      setError({
        code: err.code || "UNKNOWN_ERROR",
        message: err.message || "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      {!otpSent ? (
        <form onSubmit={handleSubmit(onSubmitPhone)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter your phone number"
                type="tel"
                autoCapitalize="none"
                autoComplete="tel"
                autoCorrect="off"
                disabled={loading}
                {...register("phone")}
              />
              {errors?.phone && (
                <p className="px-1 text-xs text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <Button disabled={loading}>
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Code
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          onVerifyOTP();
        }}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Verification Code</Label>
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  maxLength={6}
                  className="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <Button disabled={loading || otp.length !== 6}>
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
          </div>
        </form>
      )}
      {error && <FormError message={error.message} code={error.code} />}
    </div>
  );
} 