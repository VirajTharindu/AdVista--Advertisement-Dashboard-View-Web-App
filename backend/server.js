const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { initSlots } = require("./db");
const { initSocket } = require("./socket");
const adsRouter = require("./routes/ads");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Socket.io
initSocket(server);

// Routes
app.use("/api/ads", adsRouter);

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start server
async function start() {
    await initSlots();
    console.log("📦 PouchDB initialised with 6 ad slots.");

    server.listen(PORT, () => {
        console.log(`🚀 AdVista Backend running on http://localhost:${PORT}`);
    });
}

start().catch(console.error);
