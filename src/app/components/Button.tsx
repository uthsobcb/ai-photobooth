import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline"
    size?: "sm" | "md" | "lg"
}

export function Button({ className, variant = "default", size = "md", ...props }: ButtonProps) {
    const baseStyles = "flex items-center justify-center rounded-lg font-medium transition focus:outline-none"
    const variantStyles =
        variant === "outline"
            ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            : "bg-blue-600 text-white hover:bg-blue-700"
    const sizeStyles = size === "sm" ? "px-3 py-1 text-sm" : size === "lg" ? "px-6 py-3 text-lg" : "px-4 py-2 text-base"

    return <button className={cn(baseStyles, variantStyles, sizeStyles, className)} {...props} />
}
