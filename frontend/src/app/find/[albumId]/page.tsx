"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import { Camera } from "@/components/Camera";
import { Gallery } from "@/components/Gallary";
import { LoadingOverlay } from "@/components/Loading";
import { API, postPhoto } from "@/lib/utils";

export default function Page() {
    const { albumId } = useParams();
    const [matchedFaces, setMatchedFaces] = useState<{ url: string; score: number }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleImageCapture = async (imageData: string) => {
        if (!albumId || isLoading) return;
        setIsLoading(true);
        try {
            const data = await postPhoto(`/albums/${albumId}/find_faces`, imageData);
            setMatchedFaces(data.matches.map((m: { path: string; score: number }) => ({
                url: `${API}/images/${m.path}`,
                score: m.score,
            })));
            setSearched(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Couldn't search this album. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="mx-auto max-w-5xl px-5 pb-20 pt-28">
            <div className="mx-auto mb-10 max-w-md text-center">
                <h1 className="text-4xl font-extrabold sm:text-5xl">Find your photos</h1>
                <p className="mt-3 text-ink/70">Face the camera in good light. We&apos;ll show every photo in this album that you appear in.</p>
            </div>
            <Camera onImageCapture={handleImageCapture} />
            {isLoading && <LoadingOverlay text="Looking for you in the album…" />}

            {matchedFaces.length > 0 ? (
                <section className="mt-16 space-y-5">
                    <h2 className="text-2xl font-bold">
                        {matchedFaces.length} photo{matchedFaces.length > 1 && "s"} of you
                    </h2>
                    <Gallery images={matchedFaces} />
                </section>
            ) : searched && (
                <p className="mx-auto mt-12 max-w-sm text-center text-ink/70">
                    No matches yet. Try again with a clear, front-facing photo, or ask the host if your photos have been added.
                </p>
            )}
        </main>
    );
}
