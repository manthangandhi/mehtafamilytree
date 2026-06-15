"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-surface" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface text-muted transition-all hover:text-foreground hover:bg-surface-hover hover:scale-105 active:scale-95 border border-border"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 transition-all dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 opacity-0 transition-all dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </button>
  );
}
