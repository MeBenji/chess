import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

// Get / Create userId.
let userId = localStorage.getItem('userId')
if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);
}

// Connect to server.
const socket = io.connect("http://localhost:3000", {
    auth: { userId }
});

socket.on("connect", () => {
    console.log("connected");
});

socket.emit("quickplay");

socket.on("waiting", () => {
    console.log("waiting...");
});

socket.on("game_state", (gameState) => {
    console.log(gameState);
});