// components/Button.tsx
"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
}

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  fullWidth,
  icon,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        // Variantes de cor
        variant === "primary" &&
          "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        variant === "secondary" &&
          "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
        variant === "outline" &&
          "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus:ring-blue-500",
        // Tamanhos
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2",
        size === "lg" && "px-6 py-3 text-lg",
        // Largura completa
        fullWidth && "w-full",
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};