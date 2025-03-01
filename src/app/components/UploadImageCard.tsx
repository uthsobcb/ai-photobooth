"use client"

import { useRef } from "react"
import { Button } from "@/components/Button"
import { ImageIcon, UploadIcon } from "lucide-react"

interface UploadImageCardProps {
    onImageUpload: (imageData: string) => void
}

export function UploadImageCard({ onImageUpload }: UploadImageCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (reader.result) {
                    onImageUpload(reader.result.toString())
                }
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="flex flex-col w-48 items-center p-4 border rounded-2xl shadow-lg">
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <ImageIcon className="w-12 h-12 text-gray-500 mb-4" />
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload Image
            </Button>
        </div>
    )
}
