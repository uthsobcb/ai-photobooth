import { createContext, useContext, useState, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
    activeTab: string
    setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function useTabs() {
    const context = useContext(TabsContext)
    if (!context) {
        throw new Error("useTabs must be used within a TabsProvider")
    }
    return context
}

interface TabsProps {
    defaultValue: string
    children: ReactNode
    className?: string
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultValue)

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("space-y-4", className)}>{children}</div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    children: ReactNode
    className?: string
}

export function TabsList({ children, className }: TabsListProps) {
    return <div className={cn("flex border-b", className)}>{children}</div>
}

interface TabsTriggerProps {
    value: string
    children: ReactNode
    className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabs()
    return (
        <button
            onClick={() => setActiveTab(value)}
            className={cn(
                "flex-1 py-2 text-center text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2",
                activeTab === value && "border-b-2 border-blue-600 text-blue-600 font-semibold",
                className
            )}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string
    children: ReactNode
    className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { activeTab } = useTabs()
    return activeTab === value ? <div className={cn("p-4", className)}>{children}</div> : null
}
