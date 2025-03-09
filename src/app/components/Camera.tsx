"use client"

import { useState, useRef, useCallback } from "react"
import Webcam from "react-webcam"
import { Button } from "./Button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs"
import { CameraIcon, Upload, RefreshCw } from "lucide-react"
import { Card, CardContent } from "./Card"
import { UploadImageCard } from "./UploadImageCard"

interface CameraProps {
    onImageCapture: (imageData: string) => void
}

export function Camera({ onImageCapture }: CameraProps) {
    const [isCameraError, setCameraError] = useState(false)
    const webcamRef = useRef<Webcam>(null)

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            onImageCapture(imageSrc)
        }
    }, [onImageCapture])


    const handleCameraError = useCallback(() => {
        setCameraError(true)
    }, [])

    const retryCamera = () => {
        setCameraError(false)
    }

    return (
        <Card className="w-full max-w-lg mx-auto shadow-lg border rounded-xl">
            <CardContent className="p-5">
                <Tabs defaultValue="camera" className="w-full">

                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg ">
                        <TabsTrigger value="camera" className="relative flex items-center justify-center px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-200 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            <CameraIcon className="w-4 h-4 mr-2" />
                            Camera
                        </TabsTrigger>
                        <div className="absolute left-1/2 w-[1px] bg-gray-300"></div>
                        <TabsTrigger value="upload" className="relative flex items-center justify-center px-4 py-2 font-medium text-gray-600 transition hover:bg-gray-200 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-primary">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                        </TabsTrigger>
                    </TabsList>

                    {/* Camera Tab */}
                    <TabsContent value="camera" className="mt-5">
                        <div className="space-y-4">
                            {isCameraError ? (
                                <div className="text-center p-4 border rounded-lg bg-red-50">
                                    <p className="text-red-600 font-medium mb-4">
                                        Camera access denied or device not found.
                                    </p>
                                    <Button onClick={retryCamera} variant="outline" size="sm">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Retry Camera
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative overflow-hidden rounded-lg border bg-muted aspect-square">
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            onUserMediaError={handleCameraError}
                                            className="w-full h-full object-cover"
                                            videoConstraints={{
                                                width: 720,
                                                height: 720,
                                                facingMode: "user",
                                            }}
                                        />
                                    </div>
                                    <Button onClick={capture} className="w-full font-semibold">
                                        Capture Photo
                                    </Button>
                                </>
                            )}
                        </div>
                    </TabsContent>

                    {/* Upload Tab */}
                    <TabsContent value="upload" className="mt-5 flex justify-center items-center">

                        <UploadImageCard onImageUpload={onImageCapture} />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
