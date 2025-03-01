"use client"

import { useState } from "react"
import { Button } from "@/components/Button"
import { PlusIcon, SparklesIcon, XIcon } from "lucide-react"

export default function AlbumPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [albumName, setAlbumName] = useState("")

    const handleCreateAlbum = () => {
        if (albumName.trim()) {
            console.log("Album Created:", albumName)
            setIsModalOpen(false)
            setAlbumName("") // Reset input after creation
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="text-center space-y-4 flex flex-col">
                <h2 className="text-lg font-semibold text-black">No albums yet.</h2>
                <p className="text-gray-500 text-sm">
                    Let’s start by creating a new album. For example, this can be for a <br />
                    photo shoot or event.
                </p>
                <Button
                    className="bg-black text-white px-5 py-2 rounded-full"
                    onClick={() => setIsModalOpen(true)}
                >
                    Create Album
                </Button>
            </div>

            {/* Modal Popup */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Create New Album</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Enter album name"
                            value={albumName}
                            onChange={(e) => setAlbumName(e.target.value)}
                        />
                        <div className="flex justify-end mt-4 space-x-2">
                            <Button
                                variant="outline"
                                className="px-4 py-2 rounded-lg"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="bg-black text-white px-4 py-2 rounded-lg"
                                onClick={handleCreateAlbum}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
