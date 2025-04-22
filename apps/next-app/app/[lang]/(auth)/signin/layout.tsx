import { translations } from "@libs/i18n";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations];
  
  return {
    title: t.auth.signin.title + " - ShipEasy",
    description: t.auth.signin.welcomeBack,
  };
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 