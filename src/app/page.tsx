"use client"

import { useState } from "react"
import { Camera } from "@/components/Camera"
import { Gallery } from "@/components/Gallary"
import { LoadingOverlay } from "@/components/Loading"
import { Button } from "@/components/Button"
import { CameraIcon } from "lucide-react"

export default function Page() {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(true)

  const handleImageCapture = async (imageData: string) => {
    setIsLoading(true)
    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setImages((prev) => [...prev, imageData])
    setIsLoading(false)
    setShowCamera(false)
  }

  return (
    <main className="min-h-screen mt-32">
      <div className="container mx-auto p-4 space-y-8">
        {showCamera ? (
          <Camera onImageCapture={handleImageCapture} />
        ) : (
          <div className="text-center">
            <Button onClick={() => setShowCamera(true)} variant="outline" className="mx-auto">
              <CameraIcon className="w-4 h-4 mr-2" />
              Take Another Picture
            </Button>
          </div>
        )}
        {isLoading && <LoadingOverlay />}
        <Gallery images={images} />
      </div>
    </main>
  )
}

