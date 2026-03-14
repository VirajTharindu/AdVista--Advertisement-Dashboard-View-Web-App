"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { AdData } from "@/components/AdSlot";

interface UploadModalProps {
    ad: AdData | null;
    onClose: () => void;
    onComplete: () => void;
}

const BACKEND_URL = "http://localhost:4000";

export function UploadModal({ ad, onClose, onComplete }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState(ad?.title || "");
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".png", ".gif", ".webp"],
            "video/*": [".mp4", ".webm", ".ogg"],
        },
        maxFiles: 1,
    });

    const handleUpload = async () => {
        if (!ad) return;
        if (!file) {
            toast.error("Please select a file to upload.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("media", file);
        formData.append("title", title);

        try {
            const res = await fetch(`${BACKEND_URL}/api/ads/${ad.slotNumber}`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error(await res.text());
            }

            toast.success("File uploaded successfully! Dashboard updated.");
            onComplete();
            onClose();
        } catch (err: any) {
            toast.error(`Upload failed: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (!ad) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-lg overflow-hidden rounded-2xl bg-[#111] p-6 text-white shadow-2xl ring-1 ring-white/10"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Upload Ad (Slot {ad.slotNumber})</h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-white/10 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>

                    <div
                        {...getRootProps()}
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${isDragActive
                                ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                                : "border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:bg-white/10"
                            }`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <p className="text-center font-medium text-white">{file.name}</p>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                <p className="text-center">Drag & drop a file here, or click to browse</p>
                                <p className="mt-2 text-xs text-white/40">Images (JPEG, PNG, GIF, WEBP) or Video (MP4, WEBM)</p>
                            </>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                        <label className="text-sm text-white/60">Title (Optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="rounded-lg bg-black/50 px-4 py-2 text-white ring-1 ring-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="Sale Announcement"
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className={`flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2 text-sm font-bold text-black transition-all ${!file || isUploading ? "cursor-not-allowed opacity-50" : "hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]"
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Uploading...
                                </>
                            ) : "Upload & Publish"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
