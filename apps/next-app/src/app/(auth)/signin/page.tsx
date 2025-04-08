import { LoginForm } from "@/components/login-form"
import { SocialAuth } from "@/components/social-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <Card className="w-[380px]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Login with your favorite social account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SocialAuth />
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card relative z-10 px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <LoginForm />
        </div>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </CardContent>
    </Card>
  )
}