"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SkeletonSlot } from "./SkeletonSlot";

export interface AdData {
    _id: string;
    slotNumber: number;
    mediaType: "image" | "video" | null;
    fileName: string | null;
    originalName: string | null;
    filePath: string | null;
    title: string;
    updatedAt: string;
}

interface AdSlotProps {
    ad: AdData;
}

const BACKEND_URL = "http://127.0.0.1:4000";

export function AdSlot({ ad }: AdSlotProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Auto-play the video
    useEffect(() => {
        if (ad.mediaType === "video" && videoRef.current) {
            videoRef.current.play().catch((err) => {
                console.log("Autoplay blocked:", err);
            });
        }
    }, [ad.mediaType, ad.filePath]);

    // Reset loaded state when media changes
    useEffect(() => {
        setIsLoaded(false);
    }, [ad.filePath]);

    const isEmpty = !ad.mediaType || !ad.filePath;

    return (
        <div className="relative h-full w-full overflow-hidden bg-black outline outline-1 outline-white/10">
            <AnimatePresence mode="wait">
                <motion.div
                    key={ad.updatedAt} // Trigger animation on data change
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 h-full w-full"
                >
                    {isEmpty ? (
                        <SkeletonSlot />
                    ) : ad.mediaType === "video" ? (
                        <video
                            ref={videoRef}
                            src={`${BACKEND_URL}${ad.filePath}`}
                            className="h-full w-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                            onLoadedData={() => {
                                console.log(`Video loaded for slot ${ad.slotNumber}`);
                                setIsLoaded(true);
                            }}
                            onError={(e) => {
                                console.error(`Video error for slot ${ad.slotNumber}:`, e);
                                // Fallback to skeleton or error state
                                setIsLoaded(true);
                            }}
                        />
                    ) : (
                        <div className="relative h-full w-full overflow-hidden">
                            <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: 1.05 }} // Subtle Ken Burns effect
                                transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
                                className="h-full w-full"
                            >
                                <Image
                                    src={`${BACKEND_URL}${ad.filePath}`}
                                    alt={ad.title || `Ad slot ${ad.slotNumber}`}
                                    fill
                                    className="object-cover"
                                    onLoad={() => setIsLoaded(true)}
                                    unoptimized // Bypass Next.js image optimization for external backend URLs if not configured in next.config
                                />
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Show loading overlay while media buffers */}
            {!isEmpty && !isLoaded && (
                <div className="absolute inset-0 z-20">
                    <SkeletonSlot />
                </div>
            )}
        </div>
    );
}
