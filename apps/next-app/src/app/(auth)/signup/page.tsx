import { GalleryVerticalEnd } from "lucide-react"
import { SignupForm } from "@/components/signup-form"
import { SocialAuth } from "@/components/social-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignupPage() {
  return (
    <Card className="w-[380px]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Create an account</CardTitle>
        <CardDescription>
          Sign up with your favorite social account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SocialAuth />
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card relative z-10 px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <SignupForm />
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </CardContent>
    </Card>
  )
}