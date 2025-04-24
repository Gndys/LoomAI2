import { translations } from "@libs/i18n";

export async function generateMetadata({ params }: { params: { lang: string } }) {
  const { lang } = await params;
  const t = translations[lang as keyof typeof translations];
  
  return {
    title: t.auth.wechat.title + " - ShipEasy",
    description: t.auth.wechat.description,
  };
}

export default function WechatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 