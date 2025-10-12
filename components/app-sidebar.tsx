"use client";

import * as React from "react";
import { Target, Users, Trophy, Home, Plus, TrendingUp, Calendar, PanelLeftClose, Share2, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGoalSheet } from "@/components/dashboard/goal-sheet-provider";

// Datos de navegación
const getNavigationData = (pathname: string, actions?: { onNewGoal?: () => void }) => {
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Mis Metas",
      url: "/dashboard/goals",
      icon: Target,
      badge: "3",
      isActive: pathname === "/dashboard/goals" || pathname.startsWith("/dashboard/goals/"),
    },
    {
      title: "Comunidades",
      url: "/dashboard/communities",
      icon: Users,
      badge: "2",
      isActive: pathname === "/dashboard/communities",
    },
    {
      title: "Logros",
      url: "/dashboard/achievements",
      icon: Trophy,
      isActive: pathname === "/dashboard/achievements",
    },
    {
      title: "Progreso",
      url: "/dashboard/progress",
      icon: TrendingUp,
      isActive: pathname === "/dashboard/progress",
    },
    {
      title: "Calendario",
      url: "/dashboard/calendar",
      icon: Calendar,
      isActive: pathname === "/dashboard/calendar",
    },
  ];

  type QuickAction = {
    title: string;
    url: string;
    icon: typeof Home;
    isActive: boolean;
    badge?: string;
    onClick?: () => void;
  };

  const quickActions: QuickAction[] = [
    {
      title: "Nueva Meta",
      url: "/dashboard/goals/new",
      icon: Plus,
      isActive: pathname === "/dashboard/goals/new",
      onClick: actions?.onNewGoal,
    },
    {
      title: "Compartir Progreso",
      url: "/dashboard/progress",
      icon: Share2,
      isActive: pathname === "/dashboard/progress",
    },
    {
      title: "Unirse a Comunidad",
      url: "/dashboard/communities",
      icon: Users,
      isActive: pathname === "/dashboard/communities",
    },
    {
      title: "Programar Recordatorio",
      url: "/dashboard/calendar",
      icon: Calendar,
      isActive: pathname === "/dashboard/calendar",
    },
    {
      title: "Notificaciones",
      url: "/dashboard/notifications",
      icon: Bell,
      badge: "5",
      isActive: pathname === "/dashboard/notifications",
    },
  ];

  return { navMain, quickActions };
};

// Datos del usuario (estáticos)
const userData = {
  name: "Irving Zepeda",
  email: "irving@example.com",
  avatar: "/avatars/shadcn.jpg",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { openSheet } = useGoalSheet();
  const { navMain, quickActions } = getNavigationData(pathname, { onNewGoal: openSheet });
  const { toggleSidebar } = useSidebar();
  return (
    <Sidebar
      variant="sidebar"
      className="z-40 [&_[data-slot=sidebar-gap]]:hidden [&_[data-slot=sidebar-container]]:z-40"
      {...props}
    >
      <SidebarHeader className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs">
                  GS
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">GoalShare</span>
                  <span className="truncate text-xs text-muted-foreground">Alcanza tus metas</span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggleSidebar}>
            <PanelLeftClose className="h-4 w-4" />
            <span className="sr-only">Ocultar navegación</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} isActive={item.isActive} asChild>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Acciones Rápidas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((item) => {
                const handleClick = item.onClick ?? (() => router.push(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title} onClick={handleClick}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{userData.name}</span>
                <span className="truncate text-xs text-muted-foreground">{userData.email}</span>
              </div>
              {/* User menu is now in the header */}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
