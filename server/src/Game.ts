import type { GameId, UserId, Move } from "./types.ts";
import { Chess, type Color } from "chess.js";

interface Player {
    userId: UserId,
    color: Color
}

class Game {
    gameId: GameId;
    player1: Player | undefined;
    player2: Player | undefined;
    chess: Chess;

    constructor() {
        this.gameId = crypto.randomUUID();
        this.chess = new Chess();
    }

    addPlayer(userId: UserId) {
        if (!this.player1) {
            this.player1 = { userId: userId, color: 'w' };
        } else if (!this.player2) {
            this.player2 = { userId: userId, color: 'b' };
        }
    }

    getPlayers(): UserId[] {
        const players: UserId[] = [];
        if (this.player1) {
            players.push(this.player1.userId);
        }
        if (this.player2) {
            players.push(this.player2.userId);
        }
        return players;
    }

    isReady() {
        return (this.player1 !== null && this.player2 !== null);
    }

    getGameState(): string {
        return this.chess.fen();
    }

    makeMove(userId: UserId, move: Move): boolean {
        if (!this.player1 || !this.player2) { return false; }
        const turn = this.chess.turn();
        if (this.player1.userId === userId && this.player1.color === turn ||
            this.player2.userId === userId && this.player2.color === turn) {
            try {
                this.chess.move(move);
                return true;
            } catch (e) {
                console.error(e);
            }
        }
        return false;
    }

    isGameOver(): boolean {
        return this.chess.isGameOver()
    }

    getResult(): string {
        if (!this.chess.isGameOver()) {
            return "Ongoing game.";
        } else if (this.chess.isCheckmate()) {
            if (this.chess.turn() === 'b') {
                return "White wins.";
            } else {
                return "Black wins.";
            }
        } else {
            return "Draw.";
        }
    }
}

export default Game;