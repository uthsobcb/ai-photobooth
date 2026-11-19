"use client"

import Image from "next/image"
import { cn, downloadImage } from "@/lib/utils"
import { DownloadIcon } from "lucide-react"
import { toast } from "react-toastify"

export function Gallery({ images }: { images: { url: string; strong: boolean }[] }) {
    if (images.length === 0) return null

    return (
        <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4">
            {images.map(({ url, strong }, index) => (
                <div
                    key={url}
                    className={cn(
                        "group relative overflow-hidden rounded-xl bg-white",
                        index === 0 && "col-span-2 row-span-2",
                        index === 1 && "md:col-span-2",
                        index === 2 && "md:row-span-2",
                        index === 5 && "md:col-span-2",
                    )}
                >
                    <Image
                        src={url}
                        alt={`Photo ${index + 1} of you`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <button
                        aria-label="Download photo"
                        onClick={() => downloadImage(url).catch(() => toast.error("Download failed. Try again."))}
                        className="absolute right-2 top-2 rounded-full bg-white p-2.5 shadow md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                        <DownloadIcon className="h-4 w-4" />
                    </button>
                    <span className={`absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-xs font-bold text-ink ${strong ? "bg-focus" : "bg-white"}`}>
                        {strong ? "Strong match" : "Possible match"}
                    </span>
                </div>
            ))}
        </div>
    )
}
