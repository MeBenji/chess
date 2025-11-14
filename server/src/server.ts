import { createServer } from "http";
import { Server } from "socket.io";

const PORT: number = 3000;

const httpServer = createServer();
const io = new Server(
    httpServer,
    { cors: { origin: "https://hoppscotch.io" } }
);

io.on('connection', (socket) => {
    // console.log(socket.request.headers);
    socket.emit("message", "bananas", () => {console.log("yummy")});
});

httpServer.listen(PORT);