"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/use-translation";

export function AdjustmentDialog() {
  const { t } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setEmail("");
    setUserId("");
    setAmount("");
    setDescription("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() && !userId.trim()) {
      toast.error(t.admin.credits.adjustment.validationUser);
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
      toast.error(t.admin.credits.adjustment.validationAmount);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/credits/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || undefined,
          userId: userId.trim() || undefined,
          amount: parsedAmount,
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error(data?.error || t.common.unexpectedError);
        return;
      }

      toast.success(t.admin.credits.adjustment.success);
      resetForm();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to adjust credits:", error);
      toast.error(t.common.unexpectedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          {t.admin.credits.adjustment.action}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t.admin.credits.adjustment.title}</DialogTitle>
          <DialogDescription>
            {t.admin.credits.adjustment.description}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adjust-email">{t.admin.credits.adjustment.emailLabel}</Label>
            <Input
              id="adjust-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.admin.credits.adjustment.emailPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-user-id">{t.admin.credits.adjustment.userIdLabel}</Label>
            <Input
              id="adjust-user-id"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder={t.admin.credits.adjustment.userIdPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-amount">{t.admin.credits.adjustment.amountLabel}</Label>
            <Input
              id="adjust-amount"
              type="number"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={t.admin.credits.adjustment.amountPlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjust-description">{t.admin.credits.adjustment.noteLabel}</Label>
            <Textarea
              id="adjust-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t.admin.credits.adjustment.notePlaceholder}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isSubmitting}
            >
              {t.actions.cancel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t.common.loading : t.admin.credits.adjustment.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
