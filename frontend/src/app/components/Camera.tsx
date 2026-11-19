"use client"

import { useState, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { Button } from "./Button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs"
import { CameraIcon, Upload, RefreshCw } from "lucide-react"
import { Card, CardContent } from "./Card"
import { UploadImageCard } from "./UploadImageCard"

export function Camera({ onImageCapture }: { onImageCapture: (imageData: string) => void }) {
    const [isCameraError, setCameraError] = useState(false)
    const [ready, setReady] = useState(false)
    const webcamRef = useRef<Webcam>(null)

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) onImageCapture(imageSrc)
    }, [onImageCapture])

    return (
        <Card className="mx-auto w-full max-w-md shadow-[0_20px_50px_-20px_rgba(14,17,48,0.35)]">
            <CardContent>
                <Tabs defaultValue="camera">
                    <TabsList>
                        <TabsTrigger value="camera"><CameraIcon className="h-4 w-4" />Take a selfie</TabsTrigger>
                        <TabsTrigger value="upload"><Upload className="h-4 w-4" />Upload a photo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="camera" className="pt-2">
                        {isCameraError ? (
                            <div className="space-y-4 rounded-2xl bg-alert/10 p-6 text-center">
                                <p className="font-semibold text-alert">We can&apos;t reach your camera.</p>
                                <p className="text-sm text-ink/70">Allow camera access in your browser, or upload a photo instead.</p>
                                <Button onClick={() => setCameraError(false)} variant="outline" size="sm">
                                    <RefreshCw className="h-4 w-4" />Try again
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="focus-frame m-2" data-snap>
                                    <div className="relative aspect-square overflow-hidden rounded-xl bg-ink">
                                        <Webcam
                                            audio={false}
                                            mirrored
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            onUserMedia={() => setReady(true)}
                                            onUserMediaError={() => setCameraError(true)}
                                            className="h-full w-full object-cover"
                                            videoConstraints={{ width: 720, height: 720, facingMode: "user" }}
                                        />
                                        {!ready && <p className="absolute inset-0 flex items-center justify-center text-sm text-white/70">Starting camera…</p>}
                                    </div>
                                </div>
                                <button
                                    onClick={capture}
                                    disabled={!ready}
                                    aria-label="Take photo"
                                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-ink transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                                >
                                    <span className="h-12 w-12 rounded-full bg-booth" />
                                </button>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upload" className="pt-2">
                        <UploadImageCard onImageUpload={onImageCapture} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
