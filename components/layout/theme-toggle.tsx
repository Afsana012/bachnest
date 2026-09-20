"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    const isCurrentlyDark =
      typeof document !== "undefined"
        ? document.documentElement.classList.contains("dark")
        : resolvedTheme === "dark" || theme === "dark";

    const nextTheme = isCurrentlyDark ? "light" : "dark";
    setTheme(nextTheme);

    if (typeof document !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      type="button"
      onClick={handleToggle}
      className={
        className ||
        "w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      }
      title="Toggle Theme"
      aria-label="Toggle theme"
    >
      <Sun className="hidden dark:block h-4 w-4 text-amber-400 transition-transform" />
      <Moon className="block dark:hidden h-4 w-4 text-slate-700 transition-transform" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
