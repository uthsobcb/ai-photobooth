"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { SignInButton, UserButton, Show } from "@clerk/nextjs"
import { Button } from "./Button"

export function Logo() {
    return (
        <span className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
                <rect width="28" height="28" rx="8" fill="#2330D8" />
                <path d="M7 12V8h4M21 12V8h-4M7 16v4h4M21 16v4h-4" stroke="#FFD21F" strokeWidth="2.4" fill="none" strokeLinecap="square" />
            </svg>
            Photo Finder
        </span>
    )
}

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const link = "rounded-full px-3 py-2 text-sm font-semibold text-ink/70 hover:text-ink"

    return (
        <header className="fixed top-0 z-50 w-full border-b border-ink/10 bg-mist/85 backdrop-blur">
            <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
                <Link href="/" aria-label="Photo Finder home"><Logo /></Link>

                <div className="hidden items-center gap-2 md:flex">
                    <Link href="/#pricing" className={link}>Pricing</Link>
                    <Link href="/#faq" className={link}>FAQ</Link>
                    <Show when="signed-in">
                        <Link href="/dashboard" className={link}>My albums</Link>
                        <UserButton />
                    </Show>
                    <Show when="signed-out">
                        <SignInButton mode="modal"><button className={link}>Sign in</button></SignInButton>
                        <Link href="/dashboard"><Button size="sm">Create an album</Button></Link>
                    </Show>
                </div>

                <button onClick={() => setIsOpen(!isOpen)} className="rounded-full p-2 md:hidden" aria-label="Toggle menu" aria-expanded={isOpen}>
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            {isOpen && (
                <div className="border-t border-ink/10 bg-mist px-5 py-4 md:hidden" onClick={() => setIsOpen(false)}>
                    <div className="flex flex-col items-start gap-2">
                        <Link href="/" className={link}>Home</Link>
                        <Link href="/#pricing" className={link}>Pricing</Link>
                        <Link href="/#faq" className={link}>FAQ</Link>
                        <Show when="signed-in">
                            <Link href="/dashboard" className={link}>My albums</Link>
                            <div className="px-3"><UserButton /></div>
                        </Show>
                        <Show when="signed-out">
                            <SignInButton mode="modal"><button className={link}>Sign in</button></SignInButton>
                            <Link href="/dashboard"><Button size="sm">Create an album</Button></Link>
                        </Show>
                    </div>
                </div>
            )}
        </header>
    )
}
