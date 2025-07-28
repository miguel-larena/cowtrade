import { Request, Response } from 'express';
export declare class GameController {
    private gameService;
    constructor();
    createGame: (req: Request, res: Response) => Promise<void>;
    getGame: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    joinGame: (req: Request, res: Response) => Promise<void>;
    leaveGame: (req: Request, res: Response) => Promise<void>;
    deleteGame: (req: Request, res: Response) => Promise<void>;
    startGame: (req: Request, res: Response) => Promise<void>;
    startAuction: (req: Request, res: Response) => Promise<void>;
    placeBid: (req: Request, res: Response) => Promise<void>;
    endAuction: (req: Request, res: Response) => Promise<void>;
    matchBid: (req: Request, res: Response) => Promise<void>;
    clearAuctionSummary: (req: Request, res: Response) => Promise<void>;
    restartAuctionAfterBluff: (req: Request, res: Response) => Promise<void>;
    initiateTrade: (req: Request, res: Response) => Promise<void>;
    makeTradeOffer: (req: Request, res: Response) => Promise<void>;
    executeTrade: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=GameController.d.ts.map