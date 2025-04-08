'use client';

import { PhoneLoginForm } from "@/components/phone-login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/hooks/use-translation"

export default function LoginPage() {
  const { t } = useTranslation()

  return (
    <Card className="w-[380px]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t.auth.phone.title}</CardTitle>
        <CardDescription>
          {t.auth.phone.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <PhoneLoginForm />
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          {t.auth.phone.termsNotice} <a href="#">{t.auth.phone.termsOfService}</a>{" "}
          {t.common.and} <a href="#">{t.auth.phone.privacyPolicy}</a>.
        </div>
      </CardContent>
    </Card>
  )
}