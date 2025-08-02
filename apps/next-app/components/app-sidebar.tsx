"use client";

import { User, CreditCard, ShoppingCart, LayoutDashboard } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { t, locale: currentLocale } = useTranslation();

  // Admin dashboard item
  const dashboardItem = {
    title: t.navigation.admin.dashboard,
    url: `/admin`,
    icon: LayoutDashboard,
  }

  // Menu items.
  const items = [
    {
      title: t.navigation.admin.users,
      url: `/admin/users`,
      icon: User,
    },
    {
      title: t.navigation.admin.subscriptions,
      url: `/admin/subscriptions`,
      icon: CreditCard,
    },
    {
      title: t.navigation.admin.orders,
      url: `/admin/orders`,
      icon: ShoppingCart,
    }
  ]

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href={`/${currentLocale}`}>
          <Logo size="md" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {/* Dashboard Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={`/${currentLocale}${dashboardItem.url}`}>
                    <dashboardItem.icon />
                    <span>{dashboardItem.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Main Menu Section */}
        <SidebarGroup>
          <SidebarGroupLabel>{t.navigation.admin.application}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={`/${currentLocale}${item.url}`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
