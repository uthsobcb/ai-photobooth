"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs" // Clerk authentication
import { UploadImageCard } from "@/components/UploadImageCard"
import { Trash2Icon, DownloadIcon, Share2Icon } from "lucide-react"
import { useCallback } from "react";
import Image from "next/image"

export default function AlbumPage() {
    const params = useParams()
    const { user } = useUser() // Fetch authenticated Clerk user
    const [modal, setModal] = useState<{ show: boolean; message: string; action?: () => void }>({
        show: false,
        message: "",
        action: undefined,
    });
    const [albumData, setAlbumData] = useState<{
        album_name: string;
        images: string[];
        owner: string // Album owner's Clerk user ID
    } | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    // useEffect(() => {
    //     fetchAlbumData()
    // }, [params.id])

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
    const fetchAlbumData = useCallback(async () => {
        if (!process.env.NEXT_PUBLIC_API_URL) return console.error("API URL not set");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/albums/${params.id}`)
            if (!response.ok) throw new Error("Failed to fetch album data");

            const data = await response.json()
            setAlbumData(data)
        } catch (error) {
            console.error('Error fetching album:', error)
        }
    }, [params.id])

    useEffect(() => {
        fetchAlbumData();
    }, [fetchAlbumData]);


    const deleteImage = async (imageName: string) => {
        if (!user?.id) {
            setModal({ show: true, message: "You must be logged in to delete images." });
            return;
        }

        if (albumData?.owner !== user.id) {
            setModal({ show: true, message: "You are not authorized to delete this image." });
            return;
        }

        setModal({
            show: true,
            message: "Are you sure you want to delete this image?",
            action: async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete_image`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image_name: imageName, album_id: params.id }),
                    });

                    if (!response.ok) throw new Error("Failed to delete image");

                    fetchAlbumData();
                } catch (error) {
                    console.error("Error deleting image:", error);
                }
                setModal({ show: false, message: "" });
            },
        });
    };

    // Modal Component
    const Modal = () => {
        if (!modal.show) return null;

        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <p className="text-lg">{modal.message}</p>
                    <div className="mt-4 flex justify-end">
                        {modal.action ? (
                            <>
                                <button
                                    onClick={() => setModal({ show: false, message: "" })}
                                    className="mr-2 px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={modal.action}
                                    className="px-4 py-2 bg-red-600 text-white rounded"
                                >
                                    Confirm
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setModal({ show: false, message: "" })}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    // const deleteImage = async (imageName: string) => {
    //     if (!user?.id) {
    //         alert("You must be logged in to delete images.");
    //         return;
    //     }

    //     if (albumData?.owner !== user.id) {
    //         alert("You are not authorized to delete this image.");
    //         return;
    //     }

    //     if (confirm('Are you sure you want to delete this image?')) {
    //         try {
    //             const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete_image`, {
    //                 method: 'DELETE',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({ image_name: imageName, album_id: params.id }),
    //             });

    //             if (!response.ok) throw new Error("Failed to delete image");

    //             fetchAlbumData();
    //         } catch (error) {
    //             console.error('Error deleting image:', error);
    //         }
    //     }
    // }

    const downloadImage = (imageUrl: string) => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = imageUrl.split("/").pop() || "downloaded-image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="min-h-screen mt-32">
            <Modal />

            <div className="container mx-auto p-4 space-y-8">
                <h1 className="text-2xl font-bold">{albumData?.album_name || "Loading..."}</h1>
                {albumData && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                const shareUrl = `${window.location.origin}/find/${params.id}`;
                                navigator.clipboard.writeText(shareUrl);
                                setModal({ show: true, message: "Link copied to clipboard!" });
                            }}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-md"
                        >
                            <Share2Icon className="w-4 h-4" />
                            Share Album
                        </button>

                        <span className="text-sm text-gray-500">Link: /find/{params.id}</span>
                    </div>
                )}

                {user?.id && albumData?.owner === user.id && (
                    <UploadImageCard onImageUpload={handleImageUpload} />
                )}

                {isUploading && (
                    <div className="text-center py-4 text-gray-500">
                        Uploading image...
                    </div>
                )}

                {albumData?.images?.length ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {albumData.images.map((img) => {
                                const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/images/${img}`;
                                return (
                                    <div key={img} className="relative group">
                                        <Image
                                            src={imageUrl}
                                            alt="Album image"
                                            width={300}
                                            height={300}
                                            className="rounded-lg object-cover w-full h-[200px]"
                                        />

                                        {/* If user is the album creator, show delete button */}
                                        {user?.id && albumData?.owner === user.id ? (
                                            <button
                                                onClick={() => deleteImage(img)}
                                                className="absolute top-2 right-2 bg-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2Icon className="w-4 h-4 text-white" />

                                            </button>
                                        ) : (
                                            /* If not the creator, show download button */
                                            <button
                                                onClick={() => downloadImage(imageUrl)}
                                                className="absolute top-2 right-2 bg-blue-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <DownloadIcon className="w-4 h-4 text-white" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        No images in this album yet
                    </div>
                )}
            </div>
        </main>
    );
}
