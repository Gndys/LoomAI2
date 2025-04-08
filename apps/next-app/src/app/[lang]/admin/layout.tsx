import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export const metadata = {
  title: "ShipEasy - Admin Dashboard",
  description: "Modern shipping and logistics platform for businesses of all sizes",
  keywords: ["shipping", "logistics", "ecommerce", "delivery", "tracking"],
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-grow">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
