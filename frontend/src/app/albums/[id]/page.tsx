"use client"

import { useState, useEffect, useSyncExternalStore } from "react"
import { useParams } from "next/navigation"
import { useUser, useAuth } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { toast } from "react-toastify"
import { Trash2Icon, DownloadIcon, CopyIcon, ArrowLeftIcon } from "lucide-react"
import { UploadImageCard } from "@/components/UploadImageCard"
import { Modal } from "@/components/Modal"
import { Button } from "@/components/Button"
import { API, postPhoto, downloadImage, bearer } from "@/lib/utils"

export default function AlbumPage() {
    const { id } = useParams<{ id: string }>()
    const { user } = useUser()
    const { getToken } = useAuth()
    const [albumData, setAlbumData] = useState<{ album_name: string; images: string[]; owner: string } | null>(null)
    const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading")
    const [uploading, setUploading] = useState(0) // photos still in flight
    const [toDelete, setToDelete] = useState<string | null>(null)

    const isOwner = !!user?.id && albumData?.owner === user.id
    // Site origin without a mount effect: "" on the server, real value on the client
    const origin = useSyncExternalStore(() => () => {}, () => window.location.origin, () => "")
    const shareUrl = `${origin}/find/${id}`

    const [version, setVersion] = useState(0)
    const refresh = () => setVersion((v) => v + 1)

    useEffect(() => {
        let stale = false
        fetch(`${API}/albums/${id}`)
            .then((r) => { if (!r.ok) throw new Error("Album not found"); return r.json() })
            .then((data) => { if (!stale) { setAlbumData(data); setStatus("ready") } })
            .catch(() => { if (!stale) setStatus("missing") })
        return () => { stale = true }
    }, [id, version])

    const handleImageUpload = async (imageData: string) => {
        setUploading((n) => n + 1)
        try {
            await postPhoto(`/albums/${id}/upload`, imageData, await getToken(), user?.id)
            toast.success("Photo added")
            refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Upload failed. Try again.")
        } finally {
            setUploading((n) => n - 1)
        }
    }

    const confirmDelete = async () => {
        const image_name = toDelete
        setToDelete(null)
        try {
            const response = await fetch(`${API}/delete_image`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", ...bearer(await getToken()) },
                body: JSON.stringify({ image_name, album_id: id, user_id: user?.id }),
            })
            if (!response.ok) throw new Error()
            toast.success("Photo deleted")
            refresh()
        } catch {
            toast.error("Couldn't delete the photo. Try again.")
        }
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            toast.success("Link copied")
        } catch {
            toast.error("Couldn't copy. Select the link and copy it manually.")
        }
    }

    if (status === "missing") {
        return (
            <main className="mx-auto max-w-6xl px-5 pt-32">
                <h1 className="text-3xl font-bold">This album doesn&apos;t exist</h1>
                <p className="mt-2 text-ink/70">It may have been deleted, or the link is wrong.</p>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-6xl px-5 pb-20 pt-28">
            <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this photo?">
                <p className="text-ink/70">It will be removed from the album and from face search.</p>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setToDelete(null)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete photo</Button>
                </div>
            </Modal>

            {isOwner && (
                <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink">
                    <ArrowLeftIcon className="h-4 w-4" /> My albums
                </Link>
            )}
            <h1 className="text-4xl font-extrabold sm:text-5xl">{albumData?.album_name ?? " "}</h1>
            {albumData && (
                <p className="mt-2 text-ink/60">
                    {albumData.images.length} photo{albumData.images.length !== 1 && "s"}
                </p>
            )}

            {albumData && (
                <div className="mt-8 rounded-3xl bg-white p-5 sm:p-6">
                    <h2 className="text-lg font-bold">Guest link</h2>
                    <p className="mt-1 text-sm text-ink/60">Guests open this link, take a selfie and get their photos.</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <input
                            readOnly
                            value={shareUrl}
                            aria-label="Guest link"
                            onFocus={(e) => e.currentTarget.select()}
                            className="min-w-0 flex-1 rounded-full bg-mist px-5 py-2.5 text-sm"
                        />
                        <Button onClick={copyLink}><CopyIcon className="h-4 w-4" />Copy link</Button>
                    </div>
                </div>
            )}

            {isOwner && (
                <div className="mt-6">
                    <UploadImageCard multiple onImageUpload={handleImageUpload} />
                    {uploading > 0 && (
                        <p role="status" className="mt-3 text-sm font-semibold text-booth">
                            Uploading {uploading} photo{uploading > 1 && "s"}…
                        </p>
                    )}
                </div>
            )}

            {albumData?.images.length ? (
                <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {albumData.images.map((img) => {
                        const imageUrl = `${API}/images/${img}`
                        return (
                            <div key={img} className="group relative aspect-square overflow-hidden rounded-xl bg-white">
                                <Image
                                    src={imageUrl}
                                    alt="Album photo"
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <button
                                    aria-label={isOwner ? "Delete photo" : "Download photo"}
                                    onClick={() => isOwner
                                        ? setToDelete(img)
                                        : downloadImage(imageUrl).catch(() => toast.error("Download failed. Try again."))}
                                    className={`absolute right-2 top-2 rounded-full p-2.5 shadow transition-opacity md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 ${isOwner ? "bg-alert text-white" : "bg-white text-ink"}`}
                                >
                                    {isOwner ? <Trash2Icon className="h-4 w-4" /> : <DownloadIcon className="h-4 w-4" />}
                                </button>
                            </div>
                        )
                    })}
                </div>
            ) : status === "ready" && (
                <p className="mt-12 max-w-sm text-ink/70">
                    {isOwner ? "No photos yet. Add the event's photos above and guests can start finding themselves." : "The host hasn't added photos yet."}
                </p>
            )}
        </main>
    )
}
