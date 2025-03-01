import React from "react";
import { ArrowLeft, Link, Download, MoreVertical, Menu, CheckSquare } from "lucide-react";
import { Button } from "@/components/Button"; // Adjust the import path if necessary
import { Gallery } from "@/components/Gallary";
const GalleryPage = () => {
    const images = [
        //mock data
        '/file.svg'
    ];
    return (
        <div className="flex flex-col mt-20 items-center justify-around bg-white text-black">
            <div className="w-full max-w-6xl p-4">
                {/* Top Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <Button>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <span className="text-lg font-semibold">test</span>
                    <div className="flex space-x-3">
                        <Button>
                            <Link className="w-6 h-6" />
                        </Button>
                        <Button>
                            <Download className="w-6 h-6" />
                        </Button>

                    </div>
                </div>


                <Gallery images={images} />

            </div>
        </div >
    );
};

export default GalleryPage;
