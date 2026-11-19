"use client"

import { useEffect, useRef, type ReactNode } from "react"

// Native <dialog>: focus trap, Esc to close and backdrop come for free.
export function Modal({ open, onClose, title, children }: {
    open: boolean; onClose: () => void; title: string; children: ReactNode
}) {
    const ref = useRef<HTMLDialogElement>(null)
    useEffect(() => {
        const d = ref.current
        if (d && open && !d.open) d.showModal()
        if (d && !open && d.open) d.close()
    }, [open])

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => e.target === ref.current && onClose()}
            className="m-auto w-[min(26rem,92vw)] rounded-3xl bg-white p-6 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm sm:p-7"
        >
            <h3 className="mb-3 text-2xl font-bold">{title}</h3>
            {children}
        </dialog>
    )
}
