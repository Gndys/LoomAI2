import Header from "@/components/global-header";
import GlobalFooter from "@/components/global-footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <GlobalFooter />
    </div>
  );
} 
