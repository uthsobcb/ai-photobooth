"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { PlusIcon, Trash2Icon, PencilIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface Album {
    album_id: string;
    album_name: string;
}

export default function DashboardPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [albumName, setAlbumName] = useState("");
    const [editAlbumName, setEditAlbumName] = useState("");
    const [editAlbumId, setEditAlbumId] = useState("");
    const [albums, setAlbums] = useState<Album[]>([]);
    const { user } = useUser();

    const fetchAlbums = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-albums?user_id=${user.id}`);
            const data = await response.json();
            if (data.albums) {
                setAlbums(data.albums);
            }
        } catch (error) {
            console.error("Error fetching albums:", error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchAlbums();
        }
    }, [user?.id, fetchAlbums]);

    const handleCreateAlbum = async () => {
        if (albumName.trim()) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create_album`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: user?.id,
                        album_name: albumName,
                    }),
                });

                const data = await response.json();
                if (data.album_id) {
                    await fetchAlbums();
                    window.location.href = `/albums/${data.album_id}`;
                }
            } catch (error) {
                console.error("Error creating album:", error);
            }
            setIsModalOpen(false);
            setAlbumName("");
        }
    };

    const deleteAlbum = async (albumId: string) => {
        if (confirm("Are you sure you want to delete this album?")) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete_album`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ album_id: albumId }),
                });

                if (response.ok) {
                    fetchAlbums();
                }
            } catch (error) {
                console.error("Error deleting album:", error);
            }
        }
    };

    const handleEditAlbum = async () => {
        if (!editAlbumId || !editAlbumName.trim()) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/edit_album`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    album_id: editAlbumId,
                    new_album_name: editAlbumName,
                }),
            });

            if (response.ok) {
                fetchAlbums();
                setIsEditModalOpen(false);
                setEditAlbumName("");
            }
        } catch (error) {
            console.error("Error updating album:", error);
        }
    };

    return (
        <main className="min-h-screen mt-32">
            <div className="container mx-auto p-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-semibold">My Albums</h2>
                    <Button className="bg-black text-white px-5 py-2 rounded-full" onClick={() => setIsModalOpen(true)}>
                        <PlusIcon className="w-4 h-4 mr-2" /> Create Album
                    </Button>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-lg font-semibold">Create New Album</h3>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                                placeholder="Enter album name"
                                value={albumName}
                                onChange={(e) => setAlbumName(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button className="bg-black text-white" onClick={handleCreateAlbum}>Create</Button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {albums.map((album) => (
                        <div key={album.album_id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                                <Link href={`/albums/${album.album_id}`} className="text-lg font-semibold text-gray-900 hover:underline truncate">
                                    {album.album_name}
                                </Link>
                                <div className="flex space-x-3">
                                    <button onClick={() => { setEditAlbumId(album.album_id); setEditAlbumName(album.album_name); setIsEditModalOpen(true); }} className="text-blue-500 hover:text-blue-700">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={(e) => { e.preventDefault(); deleteAlbum(album.album_id); }} className="text-red-500 hover:text-red-700">
                                        <Trash2Icon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="text-gray-500 text-sm">Click to open the album and upload photos.</div>
                        </div>
                    ))}
                </div>



                {isEditModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-lg font-semibold">Edit Album Name</h3>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg p-2 mb-4"
                                value={editAlbumName}
                                onChange={(e) => setEditAlbumName(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                <Button className="bg-black text-white" onClick={handleEditAlbum}>Save</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}