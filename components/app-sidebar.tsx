"use client"

import * as React from "react"
import {
  Target,
  Users,
  Trophy,
  Home,
  Plus,
  TrendingUp,
  Calendar,
  Bell,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"

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
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Datos de navegación
const data = {
  user: {
    name: "Irving Zepeda",
    email: "irving@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Mis Metas",
      url: "/dashboard/goals",
      icon: Target,
      badge: "3",
    },
    {
      title: "Comunidades",
      url: "/dashboard/communities",
      icon: Users,
      badge: "2",
    },
    {
      title: "Logros",
      url: "/dashboard/achievements",
      icon: Trophy,
    },
    {
      title: "Progreso",
      url: "/dashboard/progress",
      icon: TrendingUp,
    },
    {
      title: "Calendario",
      url: "/dashboard/calendar",
      icon: Calendar,
    },
  ],
  quickActions: [
    {
      title: "Nueva Meta",
      url: "/dashboard/goals/new",
      icon: Plus,
    },
    {
      title: "Notificaciones",
      url: "/dashboard/notifications",
      icon: Bell,
      badge: "5",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="sidebar"
      className="z-40 [&_[data-slot=sidebar-gap]]:hidden [&_[data-slot=sidebar-container]]:z-40"
      {...props}
    >
      <SidebarHeader className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xs">
                GS
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">GoalShare</span>
                <span className="truncate text-xs text-muted-foreground">
                  Alcanza tus metas
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} isActive={item.isActive}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
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
              {data.quickActions.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-1 py-1.5">
              <Avatar className="h-8 w-8">
                <AvatarImage src={data.user.avatar} alt={data.user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {data.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{data.user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {data.user.email}
                </span>
              </div>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  }
                }}
              />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
