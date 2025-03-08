"use client"

import { useState } from "react"
import { Menu, X, Home, User } from "lucide-react"
import Link from "next/link"
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs"

const navLinks = [
    {
        name: "Home",
        href: "/",
        icon: Home,
        public: true
    },
    {
        name: "My Albums",
        href: "/dashboard",
        icon: User,
        requiresAuth: true
    },
]

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="bg-white shadow-md fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-xl font-bold text-gray-900">
                        AI Photo Finder
                    </Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
                            <Home className="w-5 h-5" />
                            <span>Home</span>
                        </Link>
                        <SignedIn>
                            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-black transition">
                                <User className="w-5 h-5" />
                                <span>My Albums</span>
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-gray-600 hover:text-black transition">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </SignedOut>
                    </div>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link href="/" className="block px-3 py-2 text-gray-600 hover:text-black">
                            Find Face
                        </Link>
                        <SignedIn>
                            <Link href="/dashboard" className="block px-3 py-2 text-gray-600 hover:text-black">
                                My Albums
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="block w-full text-left px-3 py-2 text-gray-600 hover:text-black">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="block w-full text-left px-3 py-2 text-gray-600 hover:text-black">
                                    Sign Up
                                </button>
                            </SignUpButton>
                        </SignedOut>
                    </div>
                </div>
            )}
        </nav>
    )
}
