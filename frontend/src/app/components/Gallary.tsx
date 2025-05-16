import Image from "next/image"
import { cn } from "@/lib/utils"
import { DownloadIcon } from "lucide-react"

interface GalleryProps {
    images: {
        url: string
        score: number
    }[]
}

const downloadImage = (imageUrl: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = imageUrl.split("/").pop() || "downloaded-image.jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export function Gallery({ images }: GalleryProps) {
    if (images.length === 0) return null

    return (
        <div className="p-4 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-4 max-w-7xl mx-auto">
                {images.map(({ url, score }, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                            index === 0 && "col-span-2 row-span-2",
                            "md:" +
                            (index === 1
                                ? "col-span-2"
                                : index === 2
                                    ? "row-span-2"
                                    : index === 5
                                        ? "col-span-2"
                                        : ""),
                            "bg-gradient-to-br from-muted/50 to-muted border"
                        )}
                    >
                        <Image
                            src={url || "/placeholder.svg"}
                            alt={`Matched face ${index + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        <button
                            onClick={() => downloadImage(url)}
                            className="absolute top-2 right-2 bg-blue-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <DownloadIcon className="w-4 h-4 text-white" />
                        </button>

                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            Score: {score.toFixed(3)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
