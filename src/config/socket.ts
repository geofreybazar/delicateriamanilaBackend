import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";

type ServerType = HttpServer | HttpsServer;

let io: Server;

export const setupSocket = (server: ServerType) => {
  //   const allowedOrigins = ["https://bfpncrdts.com"];
  //   const allowedOrigins = ["http://localhost:5173"];
  io = new Server(server, {
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

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}
