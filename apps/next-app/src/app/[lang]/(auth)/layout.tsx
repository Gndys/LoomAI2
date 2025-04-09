import { GalleryVerticalEnd } from "lucide-react"
import Link from "next/link";
import { translations } from "@libs/i18n";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const { lang } = await params; // Await the params object
  const t = translations[lang as keyof typeof translations];
  
  return {
    title: t.auth.signin.title + " - ShipEasy",
    description: "Sign in to your ShipEasy account",
  };
}

export default function AuthLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href={`/${params.lang}`} className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          ShipEasy
        </Link>
        {children}
      </div>
    </main>
  );
}