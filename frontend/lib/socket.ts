import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        socket = io("http://127.0.0.1:4000", {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
        });
    }
    return socket;
};
