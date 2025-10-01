"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { PanelLeftOpen } from "lucide-react";

export function NavbarSidebarTriggerPortal() {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.getElementById("dashboard-sidebar-trigger"));
  }, []);

  if (!container) {
    return null;
  }

  const shouldShow = isMobile || state === "collapsed";

  return createPortal(
    shouldShow ? (
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
        <PanelLeftOpen className="h-4 w-4" />
        <span className="sr-only">Abrir navegación</span>
      </Button>
    ) : null,
    container
  );
}
