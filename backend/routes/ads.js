const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { getAllAds, getAd, upsertAd, deleteAd } = require("../db");
const { getIO } = require("../socket");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(__dirname, "..", "uploads");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/ogg",
    ];
    cb(null, allowed.includes(file.mimetype));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
});

// GET /api/ads — return all 6 slots
router.get("/", async (_req, res) => {
    try {
        const ads = await getAllAds();
        res.json(ads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/ads/:slot — return a single slot
router.get("/:slot", async (req, res) => {
    try {
        const slot = parseInt(req.params.slot, 10);
        if (slot < 1 || slot > 6) return res.status(400).json({ error: "Slot must be 1-6" });
        const ad = await getAd(slot);
        if (!ad) return res.status(404).json({ error: "Slot not found" });
        res.json(ad);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/ads/:slot — upload or replace media for a slot
router.post("/:slot", upload.single("media"), async (req, res) => {
    try {
        const slot = parseInt(req.params.slot, 10);
        if (slot < 1 || slot > 6) return res.status(400).json({ error: "Slot must be 1-6" });
        if (!req.file) return res.status(400).json({ error: "No media file uploaded" });

        // Delete old file if exists
        const existing = await getAd(slot);
        if (existing && existing.fileName) {
            const oldPath = path.join(__dirname, "..", "uploads", existing.fileName);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";

        const data = {
            mediaType,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: `/uploads/${req.file.filename}`,
            title: req.body.title || "",
        };

        await upsertAd(slot, data);
        const updated = await getAd(slot);

        // Emit real-time event
        const io = getIO();
        io.emit("NEW_AD_AVAILABLE", updated);

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/ads/:slot — clear a slot
router.delete("/:slot", async (req, res) => {
    try {
        const slot = parseInt(req.params.slot, 10);
        if (slot < 1 || slot > 6) return res.status(400).json({ error: "Slot must be 1-6" });

        // Delete the file
        const existing = await getAd(slot);
        if (existing && existing.fileName) {
            const oldPath = path.join(__dirname, "..", "uploads", existing.fileName);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        await deleteAd(slot);
        const updated = await getAd(slot);

        // Emit real-time event
        const io = getIO();
        io.emit("NEW_AD_AVAILABLE", updated);

        res.json({ message: "Slot cleared", slot: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
