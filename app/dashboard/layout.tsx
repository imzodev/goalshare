import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NavbarSidebarTriggerPortal } from "@/components/dashboard/navbar-sidebar-trigger"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar className="z-40" />
      <NavbarSidebarTriggerPortal />
      <SidebarInset className="flex min-h-svh flex-1 flex-col min-w-0 md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
        <div className="flex-1 overflow-x-hidden">
          <div className="flex min-h-0 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-4 min-w-0">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

