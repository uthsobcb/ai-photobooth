"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { PlusIcon, XIcon } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
interface Album {
    _id: string;
    album_name: string;
    images: string[];
}

export default function DashboardPage() {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [albumName, setAlbumName] = useState("")
    const [albums, setAlbums] = useState<Album[]>([])
    const { user } = useUser()
    console.log(user?.id);
    const handleCreateAlbum = async () => {
        if (albumName.trim()) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create_album`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: user?.id,
                        album_name: albumName
                    }),
                });

                const data = await response.json();
                if (data.album_id) {
                    window.location.href = `/albums/${data.album_id}`;
                }
            } catch (error) {
                console.error('Error creating album:', error);
            }
            setIsModalOpen(false)
            setAlbumName("")
        }
    }

    return (
        <main className="min-h-screen mt-32">
            <div className="container mx-auto p-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold">My Albums</h2>
                    <Button
                        className="bg-black text-white px-5 py-2 rounded-full"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Create Album
                    </Button>
                </div>

                {/* Albums Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {albums.map((album) => (
                        <Link
                            key={album._id}
                            href={`/albums/${album._id}`}
                            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
                        >
                            <h3 className="text-lg font-semibold">{album.album_name}</h3>
                            <p className="text-gray-500 text-sm mt-1">
                                {album.images.length} images
                            </p>
                        </Link>
                    ))}
                </div>

                {/* Create Album Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Create New Album</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                                placeholder="Enter album name"
                                value={albumName}
                                onChange={(e) => setAlbumName(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button className="bg-black text-white" onClick={handleCreateAlbum}>
                                    Create
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
