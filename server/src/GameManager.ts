import { type GameId, type UserId, type Move } from "./types.ts";
import Game from "./Game.ts";

class GameManager {
    games: Map<GameId, Game>;
    quickplayGame: GameId | undefined;

    constructor() {
        this.games = new Map<GameId, Game>();
    }

    createGame() {
        const game = new Game();
        this.games.set(game.gameId, game);
        return game;
    }

    getGame(gameId: GameId): Game | undefined {
        return this.games.get(gameId);
    }

    addPlayer(userId: UserId, gameId: GameId) {
        const game = this.games.get(gameId);
        if (game) {
            game.addPlayer(userId);
        }
    }

    makeMove(userId: UserId, gameId: GameId, move: Move): boolean {
        const game = this.getGame(gameId);
        if (!game) { return false; }
        return game.makeMove(userId, move);
    }

    isGameOver(gameId: GameId): boolean {
        const game = this.getGame(gameId);
        if (!game) {return true};
        return game.isGameOver();
    }

    getResult(gameId: GameId): string {
        const game = this.getGame(gameId);
        return "nothing to see here"
    }

    quickplay(userId: UserId): Game {
        let game: Game | undefined;
        if(this.quickplayGame) {
            game = this.games.get(this.quickplayGame)
        }
        if(!game) {
            game = this.createGame();
            this.addPlayer(userId, game.gameId);
            this.quickplayGame = game.gameId;
        } else {
            this.addPlayer(userId, game.gameId);
            this.quickplayGame = undefined;
        }
        return game;
    }
}

export default GameManager