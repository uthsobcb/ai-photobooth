"use client";

import { useState } from "react";
import { Camera } from "@/components/Camera";
import { Gallery } from "@/components/Gallary";
import { LoadingOverlay } from "@/components/Loading";

export default function Page() {
  const [matchedFaces, setMatchedFaces] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinding, setIsFinding] = useState(false);

  const handleImageCapture = async (imageData: string) => {
    setIsLoading(true);
    try {
      // Convert base64 to file
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);

      setIsFinding(true);
      const findFacesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/find_faces`, {
        method: "POST",
        body: formData,
      });

      const data = await findFacesResponse.json();
      console.log("API Response:", data);

      if (data.matches) {
        const fullUrlMatches = data.matches.map(
          (path: string) => `${process.env.NEXT_PUBLIC_API_URL}/images/${path}`
        );
        setMatchedFaces(fullUrlMatches);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setIsFinding(false);
    }
  };

  return (
    <main className="min-h-screen mt-32">
      <div className="container mx-auto p-4 space-y-8">
        <Camera onImageCapture={handleImageCapture} />
        {(isLoading || isFinding) && <LoadingOverlay />}

        {matchedFaces.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Matched Faces</h2>
            <Gallery images={matchedFaces} />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No matches found</div>
        )}
      </div>
    </main>
  );
}