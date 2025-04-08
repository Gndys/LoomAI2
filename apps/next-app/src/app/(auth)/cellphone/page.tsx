import { PhoneLoginForm } from "@/components/phone-login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <Card className="w-[380px]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Login with Phone</CardTitle>
        <CardDescription>
          Enter your phone number to receive a verification code
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <PhoneLoginForm />
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </CardContent>
    </Card>
  )
}