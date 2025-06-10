'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClientReact } from "@libs/auth/authClient";
import { changePasswordSchema } from "@libs/validators/user";
import type { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    mode: 'onBlur',
  });

  // 处理密码更改
  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await authClientReact.changePassword({
        newPassword: formData.newPassword,
        currentPassword: formData.currentPassword,
        revokeOtherSessions: true,
      });

      toast.success(t.dashboard.accountManagement.changePassword.success);
      handleClose();
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(t.dashboard.accountManagement.changePassword.errors.failed);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.dashboard.accountManagement.changePassword.title}</DialogTitle>
          <DialogDescription>
            {t.dashboard.accountManagement.changePassword.dialogDescription}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              {t.dashboard.accountManagement.changePassword.form.currentPassword}
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...register('currentPassword')}
                placeholder={t.dashboard.accountManagement.changePassword.form.currentPasswordPlaceholder}
                className={cn(errors.currentPassword && "border-destructive")}
                aria-invalid={errors.currentPassword ? "true" : "false"}
              />
              {errors.currentPassword && (
                <span className="text-destructive text-xs mt-1 block">
                  {errors.currentPassword.message === 'Current password is required'
                    ? t.dashboard.accountManagement.changePassword.errors.required
                    : errors.currentPassword.message}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              {t.dashboard.accountManagement.changePassword.form.newPassword}
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...register('newPassword')}
                placeholder={t.dashboard.accountManagement.changePassword.form.newPasswordPlaceholder}
                className={cn(errors.newPassword && "border-destructive")}
                aria-invalid={errors.newPassword ? "true" : "false"}
              />
              {errors.newPassword && (
                <span className="text-destructive text-xs mt-1 block">
                  {errors.newPassword.message === 'Password must be at least 8 characters'
                    ? t.dashboard.accountManagement.changePassword.errors.minLength
                    : errors.newPassword.message}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              {t.dashboard.accountManagement.changePassword.form.confirmPassword}
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                placeholder={t.dashboard.accountManagement.changePassword.form.confirmPasswordPlaceholder}
                className={cn(errors.confirmPassword && "border-destructive")}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              {errors.confirmPassword && (
                <span className="text-destructive text-xs mt-1 block">
                  {errors.confirmPassword.message === "Passwords don't match"
                    ? t.dashboard.accountManagement.changePassword.errors.mismatch
                    : errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose}
              disabled={loading || isSubmitting}
            >
              {t.dashboard.accountManagement.changePassword.form.cancel}
            </Button>
            <Button 
              type="submit"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
              ) : null}
              {t.dashboard.accountManagement.changePassword.form.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 