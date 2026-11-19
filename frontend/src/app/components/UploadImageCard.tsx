"use client"

import { useRef, useState } from "react"
import { ImagePlusIcon } from "lucide-react"
import { toast } from "react-toastify"

interface UploadImageCardProps {
    onImageUpload: (imageData: string) => void
    multiple?: boolean
}

export function UploadImageCard({ onImageUpload, multiple = false }: UploadImageCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFiles = (files?: FileList | null) => {
        const list = Array.from(files ?? [])
        const images = list.filter((f) => f.type.startsWith("image/"))
        if (list.length && !images.length) toast.error("Choose a PNG or JPG image")
        for (const file of multiple ? images : images.slice(0, 1)) {
            const reader = new FileReader()
            reader.onload = () => reader.result && onImageUpload(reader.result.toString())
            reader.readAsDataURL(file)
        }
    }

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={multiple ? "Add photos" : "Choose a photo"}
            className={`flex min-h-[160px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-colors
                ${isDragging ? "border-booth bg-booth/10" : "border-ink/25 bg-white hover:border-booth hover:bg-booth/5"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), fileInputRef.current?.click())}
        >
            <input
                type="file"
                accept="image/png,image/jpeg"
                multiple={multiple}
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => { handleFiles(e.target.files); e.target.value = "" }}
            />
            <ImagePlusIcon className={`h-9 w-9 ${isDragging ? "text-booth" : "text-ink/50"}`} />
            <div>
                <p className="font-semibold">{multiple ? "Add photos to this album" : "Choose a photo of your face"}</p>
                <p className="mt-1 text-sm text-ink/60">Drop {multiple ? "files" : "a file"} here or click to browse. PNG or JPG.</p>
            </div>
        </div>
    )
}
