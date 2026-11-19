import { createContext, useContext, useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

const TabsContext = createContext<{ activeTab: string; setActiveTab: (v: string) => void } | undefined>(undefined)

function useTabs() {
    const context = useContext(TabsContext)
    if (!context) throw new Error("Tabs components must be used within <Tabs>")
    return context
}

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: ReactNode; className?: string }) {
    const [activeTab, setActiveTab] = useState(defaultValue)
    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("space-y-4", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

// Segmented control
export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
    return <div role="tablist" className={cn("flex gap-1 rounded-full bg-mist p-1", className)}>{children}</div>
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
    const { activeTab, setActiveTab } = useTabs()
    const active = activeTab === value
    return (
        <button
            role="tab"
            aria-selected={active}
            onClick={() => setActiveTab(value)}
            className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-semibold transition-colors",
                active ? "bg-ink text-white" : "text-ink/60 hover:text-ink",
                className,
            )}
        >
            {children}
        </button>
    )
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
    const { activeTab } = useTabs()
    return activeTab === value ? <div role="tabpanel" className={className}>{children}</div> : null
}
