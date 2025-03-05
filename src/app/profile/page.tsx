"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Settings, Palette, Image, Sliders, User, Bell, Shield, CreditCard, HelpCircle, LogOut } from "lucide-react"

export default function ProfilePage() {
    const [profile] = useState({
        name: "John Doe",
        email: "johndoe@example.com",
    })

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white p-8 rounded-lg shadow-sm mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <User className="w-12 h-12 text-gray-500" />
                        </div>
                        <div className="text-left flex-grow">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">{profile.name}</h2>
                                <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-gray-600">{profile.email}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b border-gray-200 p-6">
                        <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Button className="justify-start bg-white hover:bg-gray-50 text-gray-800 py-4">
                                <Settings className="w-5 h-5 mr-3 text-gray-600" />
                                <div>
                                    <span className="font-medium">Branding Settings</span>
                                    <p className="text-sm text-gray-500">Customize your booth's appearance</p>
                                </div>
                            </Button>

                            <Button className="justify-start bg-white hover:bg-gray-50 text-gray-800 py-4">
                                <Palette className="w-5 h-5 mr-3 text-gray-600" />
                                <div>
                                    <span className="font-medium">Theme Customization</span>
                                    <p className="text-sm text-gray-500">Change colors and styling</p>
                                </div>
                            </Button>

                            <Button className="justify-start bg-white hover:bg-gray-50 text-gray-800 py-4">
                                <Image className="w-5 h-5 mr-3 text-gray-600" />
                                <div>
                                    <span className="font-medium">Image Settings</span>
                                    <p className="text-sm text-gray-500">Adjust quality and format preferences</p>
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="border-b border-gray-200 p-6">
                        <h3 className="text-lg font-medium mb-4">Security</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Button className="justify-start bg-white hover:bg-gray-50 text-gray-800 py-4">
                                <Shield className="w-5 h-5 mr-3 text-gray-600" />
                                <div>
                                    <span className="font-medium">Privacy & Security</span>
                                    <p className="text-sm text-gray-500">Manage your security settings</p>
                                </div>
                            </Button>

                            <Button className="justify-start bg-white hover:bg-gray-50 text-gray-800 py-4">
                                <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                                <div>
                                    <span className="font-medium">Billing & Subscription</span>
                                    <p className="text-sm text-gray-500">Manage your payment details</p>
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Button className="justify-start bg-white hover:bg-gray-50 text-gray-800 py-4">
                                <HelpCircle className="w-5 h-5 mr-3 text-gray-600" />
                                <div>
                                    <span className="font-medium">Help & Support</span>
                                    <p className="text-sm text-gray-500">Get help with your account</p>
                                </div>
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center items-center text-center">
                        <Button className="justify-center  bg-white hover:bg-gray-50 text-red-600 py-4">
                            <LogOut className="w-5 h-5 mr-3" />
                            <div>
                                <p className="text-md text-red-400">Log out of your account</p>
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
