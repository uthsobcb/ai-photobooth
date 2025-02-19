"use client";

import { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";

export default function Home() {
  const [matchedUsers, setMatchedUsers] = useState<string[]>([]);
  const [matchedImages, setMatchedImages] = useState<string[]>([]);
  const webcamRef = useRef<Webcam | null>(null);
  const API_URL = "http://localhost:8000";

  const handleCapture = async () => {
    if (!webcamRef.current) {
      alert("Webcam is not available");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Failed to capture image.");
      return;
    }

    const blob = await fetch(imageSrc).then(res => res.blob());
    const formData = new FormData();
    formData.append("file", new File([blob], "capture.jpg"));

    try {
      const response = await axios.post(`${API_URL}/match`, formData);
      setMatchedUsers(response.data.matched_users || []);
      setMatchedImages(response.data.matched_images || []);
    } catch (error: any) {
      alert(error.response?.data?.error || "Face check failed!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-100">
      <h1 className="text-xl font-semibold">Face Recognition</h1>

      {/* Webcam Capture */}
      <div className="mt-4 flex flex-col items-center">
        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-64 h-64 border" />
        <button onClick={handleCapture} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded">
          Check Face
        </button>
      </div>

      {/* Display Matched Users */}
      {matchedUsers.length > 0 && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold">Matched Users:</h3>
          <ul className="text-gray-700">
            {matchedUsers.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Display Matched Images */}
      {matchedImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Matched Images:</h3>
          <div className="flex gap-2 mt-2">
            {matchedImages.map((img, index) => (
              <img key={index} src={img} alt="Matched User" className="w-20 h-20 object-cover border rounded" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
