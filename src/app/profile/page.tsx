"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { UserIcon, UploadIcon, LogOutIcon } from "lucide-react"

export default function ProfilePage() {
    const [profile, setProfile] = useState({
        name: "John Doe",
        email: "johndoe@example.com",
        avatar: "",
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value })
    }

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (reader.result) {
                    setProfile({ ...profile, avatar: reader.result.toString() })
                }
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 shadow-lg rounded-lg w-96 text-center">
                {/* Avatar Upload */}
                <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200">
                            <UserIcon className="w-12 h-12 text-gray-500" />
                        </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={handleAvatarUpload} />
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full cursor-pointer">
                        <UploadIcon className="w-4 h-4" />
                    </label>
                </div>

                {/* Profile Info */}
                <h2 className="text-xl font-semibold mt-4">Edit Profile</h2>
                <div className="mt-4 space-y-3">
                    <Input type="text" name="name" value={profile.name} onChange={handleInputChange} placeholder="Full Name" required />
                    <Input type="email" name="email" value={profile.email} onChange={handleInputChange} placeholder="Email Address" required />
                    <Button className="w-full bg-black text-white px-4 py-2 rounded-lg">Save Changes</Button>
                </div>

                {/* Logout Button */}
                <Button className="w-full mt-4 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
