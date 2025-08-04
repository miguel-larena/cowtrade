import { GameState } from '../types/game';
export declare class GameService {
    private games;
    createGame(playerName: string): Promise<GameState>;
    getGame(gameId: string): Promise<GameState | null>;
    joinGame(gameId: string, playerName: string): Promise<GameState>;
    leaveGame(gameId: string, playerId: string): Promise<GameState>;
    deleteGame(gameId: string): Promise<void>;
    clearAllGames(): void;
    startGame(gameId: string): Promise<GameState>;
    startAuction(gameId: string, playerId: string): Promise<GameState>;
    placeBid(gameId: string, playerId: string, amount: number): Promise<GameState>;
    endAuction(gameId: string): Promise<GameState>;
    matchBid(gameId: string, playerId: string): Promise<GameState>;
    clearAuctionSummary(gameId: string): Promise<GameState>;
    restartAuctionAfterBluff(gameId: string): Promise<GameState>;
    private calculateTunaBonus;
    private finalizeAuction;
    private getCombinations;
    private transferMoneyCards;
    private moveToNextTurn;
    initiateTrade(gameId: string, initiatorId: string, partnerId: string): Promise<GameState>;
    makeTradeOffer(gameId: string, playerId: string, moneyCards: string[], animalCards: string[]): Promise<GameState>;
    executeTrade(gameId: string): Promise<GameState>;
}
//# sourceMappingURL=GameService.d.ts.map