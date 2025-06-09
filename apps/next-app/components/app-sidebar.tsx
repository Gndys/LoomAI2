"use client";

import { User, CreditCard, ShoppingCart, LayoutDashboard } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const { t } = useTranslation();

  // Admin dashboard item
  const dashboardItem = {
    title: t.navigation.admin.dashboard,
    url: "/admin",
    icon: LayoutDashboard,
  }

  // Menu items.
  const items = [
    {
      title: t.navigation.admin.users,
      url: "/admin/users",
      icon: User,
    },
    {
      title: t.navigation.admin.subscriptions,
      url: "/admin/subscriptions",
      icon: CreditCard,
    },
    {
      title: t.navigation.admin.orders,
      url: "/admin/orders",
      icon: ShoppingCart,
    }
  ]

  return (
    <Sidebar>
      <SidebarContent>
        {/* Dashboard Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href={dashboardItem.url}>
                    <dashboardItem.icon />
                    <span>{dashboardItem.title}</span>
                  </a>
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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
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
