"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Gallery } from "@/components/Gallary"
import { UploadImageCard } from "@/components/UploadImageCard"

export default function AlbumPage() {
    const params = useParams()
    const [albumData, setAlbumData] = useState<{ album_name: string; images: string[] }>()
    const [isUploading, setIsUploading] = useState(false)

    useEffect(() => {
        fetchAlbumData()
    }, [params.id])

    const fetchAlbumData = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/albums/${params.id}`)
            const data = await response.json()
            setAlbumData(data)
        } catch (error) {
            console.error('Error fetching album:', error)
        }
    }

    const handleImageUpload = async (imageData: string) => {
        setIsUploading(true)
        try {
            const response = await fetch(imageData)
            const blob = await response.blob()
            const file = new File([blob], "image.jpg", { type: "image/jpeg" })

            const formData = new FormData()
            formData.append('file', file)

            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/albums/${params.id}/upload`, {
                method: 'POST',
                body: formData,
            })

            fetchAlbumData()
        } catch (error) {
            console.error('Error uploading image:', error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <main className="min-h-screen mt-32">
            <div className="container mx-auto p-4 space-y-8">
                <h1 className="text-2xl font-bold">{albumData?.album_name}</h1>

                <UploadImageCard onImageUpload={handleImageUpload} />

                {isUploading && (
                    <div className="text-center py-4 text-gray-500">
                        Uploading image...
                    </div>
                )}

                {albumData?.images && albumData.images.length > 0 ? (
                    <Gallery
                        images={albumData.images.map(
                            img => `${process.env.NEXT_PUBLIC_API_URL}/images/${img}`
                        )}
                    />
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No images in this album yet
                    </div>
                )}
            </div>
        </main>
    )
} 