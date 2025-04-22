import { translations } from "@libs/i18n";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations];
  
  return {
    title: t.auth.signup.title + " - ShipEasy",
    description: t.auth.signup.createAccount,
  };
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 