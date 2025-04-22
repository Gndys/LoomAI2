import { translations } from "@libs/i18n";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations];
  
  return {
    title: t.auth.phone.title + " - ShipEasy",
    description: t.auth.phone.description,
  };
}

export default function CellphoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 