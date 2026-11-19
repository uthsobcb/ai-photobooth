import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument" });

export const metadata: Metadata = {
  title: "AI Photo Finder",
  description: "Upload an event's photos once. Guests take a selfie and get every photo they're in.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en" className={`${display.variable} ${body.variable}`}>
        <body>
          <ToastContainer position="bottom-center" theme="dark" />
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
