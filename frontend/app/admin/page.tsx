"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdData } from "@/components/AdSlot";
import { SlotCard } from "@/components/admin/SlotCard";
import { UploadModal } from "@/components/admin/UploadModal";
import { getSocket } from "@/lib/socket";

const BACKEND_URL = "http://localhost:4000";

export default function AdminDashboard() {
    const [ads, setAds] = useState<AdData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<AdData | null>(null);

    const fetchAds = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/ads`);
            if (!res.ok) throw new Error("Failed to fetch ads");
            const data = await res.json();

            const defaultSlots = Array.from({ length: 6 }).map((_, i) => ({
                _id: `slot_${i + 1}`,
                slotNumber: i + 1,
                mediaType: null,
                fileName: null,
                originalName: null,
                filePath: null,
                title: "",
                updatedAt: new Date().toISOString(),
            })) as AdData[];

            const merged = [...defaultSlots];
            data.forEach((ad: AdData) => {
                if (ad.slotNumber >= 1 && ad.slotNumber <= 6) {
                    merged[ad.slotNumber - 1] = ad;
                }
            });
            setAds(merged);
        } catch (err) {
            console.error(err);
            toast.error("Could not load ads.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();

        const socket = getSocket();
        socket.on("NEW_AD_AVAILABLE", (updatedAd: AdData) => {
            setAds((prev) => {
                const newAds = [...prev];
                const index = updatedAd.slotNumber - 1;
                if (index >= 0 && index < 6) {
                    newAds[index] = updatedAd;
                }
                return newAds;
            });
        });

        return () => {
            socket.off("NEW_AD_AVAILABLE");
        };
    }, []);

    const handleClearSlot = async (slotNumber: number) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/ads/${slotNumber}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to clear slot");
            toast.success(`Slot ${slotNumber} cleared.`);
            await fetchAds();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8 text-white">
            <div className="mx-auto max-w-6xl">
                <header className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Billboard Admin</h1>
                        <p className="text-white/60">Manage your 3×2 advertising grid in real-time.</p>
                    </div>
                    <a
                        href="/"
                        target="_blank"
                        className="rounded-lg bg-white/10 px-6 py-2.5 font-medium text-white transition-colors hover:bg-white/20"
                    >
                        View Dashboard
                    </a>
                </header>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {ads.map((ad) => (
                            <SlotCard
                                key={ad._id}
                                ad={ad}
                                onClick={(slot) => setSelectedSlot(slot)}
                                onClear={handleClearSlot}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedSlot && (
                <UploadModal
                    ad={selectedSlot}
                    onClose={() => setSelectedSlot(null)}
                    onComplete={fetchAds}
                />
            )}
        </div>
    );
}
