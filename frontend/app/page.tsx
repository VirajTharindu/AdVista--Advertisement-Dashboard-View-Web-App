"use client";

import { useEffect, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { AdSlot, AdData } from "@/components/AdSlot";

export default function DashboardPage() {
  const [ads, setAds] = useState<AdData[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize with exactly 6 empty slots to match the grid
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

  useEffect(() => {
    setIsClient(true);

    // Fetch initial ads
    fetch("http://127.0.0.1:4000/api/ads")
      .then((res) => res.json())
      .then((data: AdData[]) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge fetched ads into default 6-slot array
          const merged = [...defaultSlots];
          data.forEach((ad) => {
            if (ad.slotNumber >= 1 && ad.slotNumber <= 6) {
              merged[ad.slotNumber - 1] = ad;
            }
          });
          setAds(merged);
        } else {
          setAds(defaultSlots);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch ads", err);
        setAds(defaultSlots);
      });

    // Socket.io real-time updates
    const socket = getSocket();

    socket.on("NEW_AD_AVAILABLE", (updatedAd: AdData) => {
      console.log("Real-time update received:", updatedAd);
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

  if (!isClient) {
    return null; // Prevent SSR mismatch
  }

  return (
    <main className="billboard-grid bg-black">
      {ads.map((ad) => (
        <AdSlot key={`slot-${ad.slotNumber}`} ad={ad} />
      ))}
    </main>
  );
}
