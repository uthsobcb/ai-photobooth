"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/Button"
import { ImageIcon, UploadIcon } from "lucide-react"

interface UploadImageCardProps {
    onImageUpload: (imageData: string) => void
}

export function UploadImageCard({ onImageUpload }: UploadImageCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

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

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
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
        <div
            className={`flex flex-col items-center p-6 border-2 border-dashed rounded-2xl shadow-lg transition-all duration-200 
                ${isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                } cursor-pointer min-h-[200px] w-full max-w-xs justify-center`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
            <ImageIcon className={`w-16 h-16 mb-4 transition-colors duration-200 
                ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
            />
            <p className="text-sm text-gray-600 mb-4 text-center">
                Drag and drop your image here, or click to select
            </p>
            <Button variant="outline" className="pointer-events-none">
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload Image
            </Button>
        </div>
    )
}
