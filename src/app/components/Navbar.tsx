"use client"

import { useState } from "react"
import { Menu, X, Home, Camera, Upload, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Camera", href: "/camera", icon: Camera },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Profile", href: "/profile", icon: User },
]

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="bg-white shadow-md fixed top-0 w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-xl font-bold text-gray-900">
                        AI Photobooth
                    </Link>

                    <div className="hidden md:flex space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-2 text-gray-600 hover:text-black transition"
                            >
                                <link.icon className="w-5 h-5" />
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </div>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white border-t shadow-lg">
                    <div className="flex flex-col space-y-4 p-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-3 text-gray-700 hover:text-black transition"
                                onClick={() => setIsOpen(false)}
                            >
                                <link.icon className="w-5 h-5" />
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}
