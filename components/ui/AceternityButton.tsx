"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline";
}

export function AceternityButton({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  if (variant === "outline") {
    return (
      <button
        className={cn(
          "relative px-8 py-3 rounded-full bg-surface text-foreground font-semibold border border-border transition-all duration-300 hover:bg-surface-hover hover:border-primary/50",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={cn(
        "relative group overflow-hidden rounded-full px-8 py-3 font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 w-full h-full bg-primary transition-all duration-300 group-hover:bg-opacity-80" />
      <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-surface opacity-30 rotate-12 group-hover:-translate-x-40 ease" />
      <span className="relative">{children}</span>
    </button>
  );
}
