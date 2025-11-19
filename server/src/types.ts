import type { Color } from "chess.js"
import type { Socket } from "socket.io";
export { type Color, WHITE, BLACK } from "chess.js"

export type NodeEnv = "development" | "production" | "test";

export type GameId = `${string}-${string}-${string}-${string}-${string}`;
export type UserId = `${string}-${string}-${string}-${string}-${string}`;
export type Move = {
    from: string,
    to: string,
    promotion?: string
};

export type GameResult = "ongoing" | "draw" | "white wins" | "black wins";
export const ONGOING: GameResult = "ongoing";
export const DRAW: GameResult = "draw";
export const WIN_WHITE: GameResult = "white wins";
export const WIN_BLACK: GameResult = "black wins";

export type User = {
    readonly id: UserId,
    socket: Socket,
    gameId: GameId | null
}

export type Role = "Hand" | "Brain";
export type AddPlayerConfig = {
    color?: Color,
    role?: Role
}
export interface BoardGame {
    readonly id: GameId;
    addPlayer(userId: UserId, config?: AddPlayerConfig): void;
    getPlayers(): UserId[];
    makeMove(userId: UserId, move: Move): boolean;
    getGameState(): string;
    isGameOver(): boolean;
    getResult(): GameResult;
}