"use client";

import { AdData } from "@/components/AdSlot";

interface SlotCardProps {
    ad: AdData;
    onClick: (ad: AdData) => void;
    onClear: (slot: number) => void;
}

const BACKEND_URL = "http://localhost:4000";

export function SlotCard({ ad, onClick, onClear }: SlotCardProps) {
    const isEmpty = !ad.mediaType || !ad.filePath;

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10">
            {/* Thumbnail area */}
            <div
                className="group relative aspect-video cursor-pointer bg-black"
                onClick={() => onClick(ad)}
            >
                {/* Slot Number Badge */}
                <div className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 font-mono font-bold text-white backdrop-blur-md">
                    {ad.slotNumber}
                </div>

                {isEmpty ? (
                    <div className="flex h-full w-full items-center justify-center text-white/30">
                        <span className="text-sm">Empty Slot</span>
                    </div>
                ) : ad.mediaType === "video" ? (
                    <video
                        src={`${BACKEND_URL}${ad.filePath}`}
                        className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                        muted
                        playsInline
                        // A simple hack to show the first frame: we don't autoplay, just preload metadata
                        preload="metadata"
                    />
                ) : (
                    <img
                        src={`${BACKEND_URL}${ad.filePath}`}
                        alt={ad.title || "Ad thumbnail"}
                        className="h-full w-full object-cover opacity-80 flex transition-opacity group-hover:opacity-100"
                    />
                )}

                {/* Hover action overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <span className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white shadow-sm">
                        {isEmpty ? "Upload Media" : "Replace Media"}
                    </span>
                </div>
            </div>

            {/* Footer details */}
            <div className="flex items-center justify-between border-t border-white/5 p-3">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white/90 truncate max-w-[150px]">
                        {ad.title || (isEmpty ? "No active ad" : "Untitled Ad")}
                    </span>
                    <span className="text-xs text-white/50">
                        {ad.mediaType ? ad.mediaType.toUpperCase() : "Ready for use"}
                    </span>
                </div>

                {!isEmpty && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to clear this slot?')) {
                                onClear(ad.slotNumber);
                            }
                        }}
                        className="rounded p-1.5 text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
                        title="Clear Slot"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                    </button>
                )}
            </div>
        </div>
    );
}
