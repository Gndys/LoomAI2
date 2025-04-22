import { translations } from "@libs/i18n";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations];
  
  return {
    title: t.auth.forgetPassword.title + " - ShipEasy",
    description: t.auth.forgetPassword.description,
  };
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 