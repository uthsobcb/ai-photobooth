import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "danger"
    size?: "sm" | "md" | "lg"
}

const variants = {
    default: "bg-booth text-white hover:bg-booth-dark",
    outline: "bg-white text-ink ring-1 ring-inset ring-ink/20 hover:bg-ink/5",
    danger: "bg-alert text-white hover:bg-alert/90",
}
const sizes = { sm: "px-3.5 py-1.5 text-sm", md: "px-5 py-2.5", lg: "px-7 py-3.5 text-lg" }

export function Button({ className, variant = "default", size = "md", type = "button", ...props }: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant], sizes[size], className,
            )}
            {...props}
        />
    )
}
