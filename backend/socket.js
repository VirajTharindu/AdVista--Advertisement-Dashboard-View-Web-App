let io = null;

function initSocket(server) {
    const { Server } = require("socket.io");
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000"],
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`✅ Client connected: ${socket.id}`);
        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

function getIO() {
    if (!io) throw new Error("Socket.io not initialised. Call initSocket first.");
    return io;
}

module.exports = { initSocket, getIO };
