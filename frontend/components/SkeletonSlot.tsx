"use client";

import { motion } from "framer-motion";

export function SkeletonSlot() {
    return (
        <div className="relative h-full w-full overflow-hidden bg-white/5">
            {/* Shimmer gradient */}
            <motion.div
                animate={{
                    x: ["-100%", "200%"],
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 1.5,
                }}
                className="absolute inset-0 z-10 w-[50%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]"
            />
            {/* Centered logo/placeholder */}
            <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center opacity-20">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mb-4 text-white"
                >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <div className="h-4 w-32 rounded bg-white/50"></div>
            </div>
        </div>
    );
}
