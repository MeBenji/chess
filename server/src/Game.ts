import { Chess } from "chess.js";
import { ONGOING, BLACK, WHITE, type AddPlayerConfig, type GameId, type GameResult, type Move, type UserId, WIN_WHITE, WIN_BLACK, DRAW, type BoardGame } from "./types.ts";

class ChessGame implements BoardGame {
    readonly id: GameId;
    private _chess: Chess;
    private _playerBlack: UserId | undefined;
    private _playerWhite: UserId | undefined;

    constructor() {
        this.id = crypto.randomUUID();
        this._chess = new Chess();
    }

    addPlayer(userId: UserId, config?: AddPlayerConfig): void {
        if (config?.color) {
            if (config.color === WHITE) {
                if (!this._playerWhite)
                    this._playerWhite = userId;
            } else {
                if (!this._playerBlack)
                    this._playerBlack = userId;
            }
        } else {
            if (!this._playerWhite) {
                if (!this._playerBlack) {
                    if (Math.floor(Math.random() * 2)) {
                        this._playerWhite = userId;
                    } else {
                        this._playerBlack = userId;
                    }
                } else {
                    this._playerWhite = userId;
                }
            } else if (!this._playerBlack) {
                this._playerBlack = userId;
            }
        }
    }

    getPlayers(): UserId[] {
        const players: UserId[] = [];
        if (this._playerWhite)
            players.push(this._playerWhite);
        if (this._playerBlack)
            players.push(this._playerBlack);
        return players;
    }

    makeMove(userId: UserId, move: Move): boolean {
        const turn = this._chess.turn();
        if ((turn === WHITE && userId === this._playerWhite) ||
            (turn === BLACK && userId === this._playerBlack)) {
            try {
                this._chess.move(move);
                return true;
            } catch (error) {
            }
        }
        return false;
    }

    getGameState(): string {
        return this._chess.fen();
    }

    isGameOver(): boolean {
        return this._chess.isGameOver();
    }

    getResult(): GameResult {
        if (this._chess.isCheckmate()) {
            if (this._chess.turn() === WHITE) {
                return WIN_WHITE;
            } else {
                return WIN_BLACK;
            }
        } else if (this._chess.isDraw()) {
            return DRAW;
        } else {
            return ONGOING;
        }
    }

    printBoard(): void {
        console.log(this._chess.ascii());
    }
}

export default ChessGame;