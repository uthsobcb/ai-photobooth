import Image from "next/image"
import { cn } from "@/lib/utils"

interface GalleryProps {
    images: string[]
}

export function Gallery({ images }: GalleryProps) {
    if (images.length === 0) {
        return null
    }

    return (
        <div className="p-4 rounded-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-4 max-w-7xl mx-auto">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={cn(
                            "relative group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                            // Create bento grid layout with different sized items
                            index === 0 && "col-span-2 row-span-2", // First image is large on all screens
                            "md:" +
                            (index === 1
                                ? "col-span-2"
                                : index === 2
                                    ? "row-span-2"
                                    : index === 5
                                        ? "col-span-2"
                                        : ""),
                            "bg-gradient-to-br from-muted/50 to-muted border",
                        )}
                    >
                        <Image
                            src={image || "/placeholder.svg"}
                            alt={`Captured image ${index + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {/* Glass overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <p className="text-white text-sm font-medium">Image {index + 1}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
