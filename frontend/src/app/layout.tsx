import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { ClerkProvider } from '@clerk/nextjs'
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "AI Photobooth",
  description: "Face verification and album management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ToastContainer />
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
