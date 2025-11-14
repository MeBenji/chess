import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { type UserId, type Move } from "./types.ts";
import SessionManager from "./SessionManager.ts";
import GameManager from "./GameManager.ts";

const PORT: number = 3000;

const httpServer = createServer();
const io = new Server(
    httpServer,
    // { cors: { origin: "https://hoppscotch.io" } }
    // { cors: { origin: "http://localhost/5500" } }
    { cors: { origin: "*" } }
);

const sessionManager = new SessionManager();
const gameManager = new GameManager();

io.on("connection", (socket) => {
    // User authentification
    const userId: UserId | undefined = socket.handshake.auth.userId;
    if (!userId) {
        socket.disconnect();
        return;
    }
    console.log(`User ${userId} connected.`)

    sessionManager.connectUser(userId, socket.id);
    const session = sessionManager.getSession(userId);

    // Reconnect to existing game.
    if (session?.gameId) {
        const game = gameManager.getGame(session.gameId);
        if (game) {
            socket.emit("game_state", game.getGameState());
            socket.join(game.gameId);
        }
    }

    socket.on("init_game", () => {
        console.log("TODO init game");
    });

    socket.on("quickplay", () => {
        const game = gameManager.quickplay(userId);
        sessionManager.setUserGame(userId, game.gameId);
        socket.join(game.gameId);
        if (game.isReady()) {
            io.to(game.gameId).emit("game_state", game.getGameState());
        } else {
            io.to(game.gameId).emit("waiting");
        }
    });

    socket.on("move", (move: Move) => {
        if (!session?.gameId) { return; }
        // const game = gameManager.getGame(session.gameId);
        // if (!game) { return; }
        // game.makeMove(userId, move);
        const isValid = gameManager.makeMove(userId, session.gameId, move);
        if (isValid) { io.to(session.gameId).emit("move", move); }
        const isGameOver = gameManager.isGameOver(session.gameId);
        const result = gameManager.getResult(session.gameId);
        if (isGameOver) {
            io.to(session.gameId).emit("game_over");
            const game = gameManager.getGame(session.gameId);
            if (game) {
                const players = game.getPlayers();
                for (let player of players) {
                    sessionManager.setUserGame(player, undefined);
                }
            }
        }
    });

    socket.on("disconnect", (reason) => {
        console.log(`User ${userId} disconnected. Reason: ${reason}`);
        sessionManager.disconnectUser(userId);
    });
});

httpServer.listen(PORT);