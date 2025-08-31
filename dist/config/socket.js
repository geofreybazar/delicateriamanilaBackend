"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
let io;
const setupSocket = (server) => {
    //   const allowedOrigins = ["https://bfpncrdts.com"];
    //   const allowedOrigins = ["http://localhost:5173"];
    io = new socket_io_1.Server(server, {
        cors: {
            //   origin: (origin, callback) => {
            //     if (allowedOrigins.includes(origin || "")) {
            //       callback(null, true);
            //     } else {
            //       callback(new Error("Not allowed by CORS"));
            //     }
            //   },
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "PUT"],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    io.on("connection", (socket) => {
        // socket.on("heartbeat", (data) => {
        //   console.log(
        //     `Received heartbeat from user ${socket.id} at ${data.timestamp}`
        //   );
        // });
        socket.on("heartbeat", (data) => {
            console.log("Heartbeat:", data);
        });
        socket.on("disconnect", () => {
            console.log("socket disconnected");
        });
    });
};
exports.setupSocket = setupSocket;
function getIO() {
    if (!io)
        throw new Error("Socket.io not initialized!");
    return io;
}
