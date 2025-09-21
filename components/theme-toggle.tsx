"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch
  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
   >
      {/* Render both icons to avoid layout shift, control visibility */}
      <Sun className={`h-4 w-4 ${mounted && isDark ? "hidden" : ""}`} />
      <Moon className={`h-4 w-4 ${mounted && !isDark ? "hidden" : ""}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
