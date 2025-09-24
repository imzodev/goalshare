import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar className="z-40" />
      <SidebarInset className="flex min-h-svh flex-1 flex-col min-w-0 md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
        <header
          className="sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all ease-linear md:px-6 md:peer-data-[state=expanded]:py-2 md:peer-data-[state=collapsed]:py-4 md:peer-data-[state=collapsed]:gap-3 group-has-[[data-collapsible=icon]]/sidebar-wrapper:py-2"
        >
          <SidebarTrigger className="-ml-1 transition-all md:peer-data-[state=expanded]:-ml-2 md:peer-data-[state=collapsed]:-ml-1" />
          <Separator orientation="vertical" className="h-5 transition-all md:h-6" />
        </header>
        <div className="flex-1 overflow-x-hidden">
          <div className="flex min-h-0 flex-col gap-4 p-4 pt-0 md:p-6 md:pt-4 min-w-0">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

