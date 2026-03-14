"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SoundUnlock({ onUnlock }: { onUnlock: () => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const hasUnlocked = sessionStorage.getItem("soundUnlocked");
        if (!hasUnlocked) {
            setVisible(true);
        } else {
            onUnlock();
        }
    }, [onUnlock]);

    const handleUnlock = () => {
        // Unmute all videos on the page
        const videos = document.querySelectorAll("video");
        videos.forEach((video) => {
            video.muted = false;
            // Also ensure it is playing
            video.play().catch(console.error);
        });
        sessionStorage.setItem("soundUnlocked", "true");
        setVisible(false);
        onUnlock();
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleUnlock}
                        className="flex items-center gap-3 rounded-2xl bg-white/10 px-8 py-5 text-2xl font-semibold tracking-wide text-white shadow-[0_0_40px_rgba(0,240,255,0.3)] ring-1 ring-white/20 transition-all hover:bg-white/20 hover:shadow-[0_0_60px_rgba(0,240,255,0.5)]"
                    >
                        <span className="text-3xl">🔊</span>
                        Enable Sound
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
