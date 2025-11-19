import { createServer } from "http";
import { Server } from "socket.io";
import type { UserId  } from "./types.ts";
import GameManager from "./GameManager.ts";
import { DEFAULT_CORS_PORT, DEFAULT_NODE_ENV, DEFAULT_PORT, DEVELOPMENT } from "./constants.ts";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;
const CORS_PORT = process.env.CORS_PORT ? parseInt(process.env.CORS_PORT) : DEFAULT_CORS_PORT;
const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : DEFAULT_NODE_ENV;

const httpServer = createServer();
const io = new Server(
    httpServer,
    { cors: { origin: NODE_ENV === DEVELOPMENT ? "*" : `http://localhost:${CORS_PORT}` } }
);

const gameManager = new GameManager(io);

let i = 1;

io.on("connection", (socket) => {
    // User authentification
    // const userId: UserId | undefined = socket.handshake.auth.userId;
    // if (!userId) {
    //     socket.disconnect();
    //     return;
    // }
    // console.log(`User ${userId} connected.`)
    const userId: UserId = `u-s-e-r-${i}`;
    i++;

    gameManager.addUser(userId, socket);

    socket.on("disconnect", (reason) => {
        console.log(`User ${userId} disconnected. Reason: ${reason}`);
        gameManager.removeUser(userId);
    });
});

httpServer.listen(PORT);
console.log(`Server listening on port: ${PORT}`);