import { Server, Socket } from "socket.io";
import ChessGame from "./Game.ts";
import type { BoardGame, GameId, Move, User, UserId } from "./types.ts";
import { GAME_OVER, GAME_STATE, INIT_GAME, MOVE, QUICKPLAY } from "./constants.ts";

class GameManager {
    private users: Map<UserId, User>;
    private games: Map<GameId, BoardGame>;
    private quickplayQueue: UserId | null;
    private io: Server;

    constructor(io: Server) {
        this.users = new Map<UserId, User>();
        this.games = new Map<GameId, BoardGame>();
        this.quickplayQueue = null;
        this.io = io;
    }

    addUser(userId: UserId, socket: Socket) {
        const user = { id: userId, socket: socket, gameId: null };
        this.users.set(user.id, user);
        this.addHandlers(user.id);
    }

    removeUser(userId: UserId) {
        this.users.delete(userId);
    }

    private addHandlers(userId: UserId) {
        const user = this.getUser(userId);
        if (!user)
            return;

        user.socket.on(QUICKPLAY, () => {
            this.quickplay(user.id);
        });

        user.socket.on(MOVE, (data) => {
            const move = JSON.parse(data);
            if (this.isMove(move))
                this.moveHandler(user.id, move);
        });
    }

    private isMove(obj: unknown): obj is Move {
        if (obj) {
            const move: Move = obj as Move;
            if (move &&
                move?.from &&
                move?.to &&
                typeof move.from === "string" &&
                typeof move.to === "string" &&
                (!move.promotion || typeof move.promotion === "string"))
                return true;
        }
        return false;
    }

    private moveHandler(userId: UserId, move: any) {
        const user = this.getUser(userId);
        if (!user || !user.gameId)
            return;
        const game = this.games.get(user.gameId);
        if (!game) {
            user.gameId = null;
            return;
        }
        if (game.makeMove(user.id, move)) {
            user.socket.to(game.id).emit(MOVE, move);
            if (game.isGameOver()) {
                this.io.to(game.id).emit(GAME_OVER, game.getResult());
                this.removeGame(game.id);
            }
        }
    }

    createGame(): BoardGame {
        const game: BoardGame = new ChessGame();
        this.games.set(game.id, game);
        return game;
    }

    removeGame(gameId: GameId) {
        this.io.socketsLeave(gameId);
        const game = this.getGame(gameId);
        if (!game)
            return;
        for (let player of game.getPlayers()) {
            const user = this.getUser(player);
            if (user) {
                user.gameId = null;
            }
        }
        this.games.delete(game.id);
    }

    getGame(gameId: GameId): BoardGame | undefined {
        return this.games.get(gameId);
    }

    getUser(userId: UserId): User | undefined {
        return this.users.get(userId);
    }

    quickplay(userId: UserId) {
        const user = this.getUser(userId);
        if (!user)
            return;
        if (!this.quickplayQueue) {
            this.quickplayQueue = user.id;
        } else {
            const opponent = this.getUser(this.quickplayQueue);
            if (!opponent || !opponent.socket) {
                this.quickplayQueue = user.id;
                return;
            }
            this.quickplayQueue = null;
            const game = this.createGame();
            game.addPlayer(opponent.id);
            game.addPlayer(user.id);
            opponent.gameId = game.id;
            user.gameId = game.id;
            if (opponent.socket)
                opponent.socket.join(game.id);
            if (user.socket)
                user.socket.join(game.id);
            this.io.to(game.id).emit(GAME_STATE, game.getGameState());
        }
    }
}

export default GameManager