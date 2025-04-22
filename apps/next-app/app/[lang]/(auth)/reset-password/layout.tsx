import { translations } from "@libs/i18n";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations];
  
  return {
    title: t.auth.resetPassword.title + " - ShipEasy",
    description: t.auth.resetPassword.description,
  };
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 