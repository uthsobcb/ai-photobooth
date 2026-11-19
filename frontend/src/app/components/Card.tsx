import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Card({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("rounded-3xl bg-white", className)}>{children}</div>
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("p-5 sm:p-6", className)}>{children}</div>
}
