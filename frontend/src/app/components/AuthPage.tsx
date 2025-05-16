"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"

export default function AuthPage() {
    const [isRegister, setIsRegister] = useState(false)
    const [formData, setFormData] = useState({ email: "", password: "", name: "" })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log(isRegister ? "Registering..." : "Logging in...", formData)
        // Add API call here
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 shadow-lg rounded-lg w-96">
                <h2 className="text-xl font-semibold text-center mb-6">
                    {isRegister ? "Create an Account" : "Welcome Back"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <Input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    )}
                    <Input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Button
                        type="submit"
                        className="w-full bg-black text-white px-4 py-2 rounded-lg"
                    >
                        {isRegister ? "Sign Up" : "Login"}
                    </Button>
                </form>
                <p className="text-sm text-center text-gray-600 mt-4">
                    {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-black font-semibold"
                    >
                        {isRegister ? "Login" : "Sign up"}
                    </button>
                </p>
            </div>
        </div>
    )
}
