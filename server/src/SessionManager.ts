import { type GameId, type SocketId, type UserId } from "./types.ts";

type Session = {
    socket: SocketId,
    gameId: GameId | undefined,
    isConnected: boolean,
    lastSeen: number
}

class SessionManager {
    sessions: Map<UserId, Session>;
    constructor() {
        this.sessions = new Map<UserId, Session>();
    }

    connectUser(userId: UserId, socketId: SocketId) {
        const session: Session | undefined = this.sessions.get(userId);
        this.sessions.set(userId, {
            socket: socketId,
            gameId: session?.gameId,
            isConnected: true,
            lastSeen: Date.now()
        });
    }

    disconnectUser(userId: UserId) {
        const session: Session | undefined = this.sessions.get(userId);
        if (session) {
            if (!session.gameId) {
                this.sessions.delete(userId);
            } else {
                session.isConnected = false;
                session.lastSeen = Date.now();
            }
        }
    }

    setUserGame(userId: UserId, gameId: GameId | undefined) {
        const session = this.sessions.get(userId);
        if (session) {
            session.gameId = gameId;
        }
    }

    getSession(userId: UserId) {
        return this.sessions.get(userId);
    }

}

export default SessionManager;