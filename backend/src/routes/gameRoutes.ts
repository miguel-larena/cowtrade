import { Router } from 'express';
import { GameController } from '../controllers/GameController';

const router = Router();
const gameController = new GameController();

// Game management endpoints
router.post('/create', gameController.createGame);
router.get('/:gameId', gameController.getGame);
router.post('/:gameId/join', gameController.joinGame);
router.delete('/:gameId', gameController.deleteGame);

// Game action endpoints
router.post('/:gameId/start', gameController.startGame);
router.post('/:gameId/auction/start', gameController.startAuction);
router.post('/:gameId/auction/bid', gameController.placeBid);
router.post('/:gameId/auction/end', gameController.endAuction);
router.post('/:gameId/auction/match', gameController.matchBid);
router.post('/:gameId/auction/clear-summary', gameController.clearAuctionSummary);
router.post('/:gameId/auction/restart-after-bluff', gameController.restartAuctionAfterBluff);
router.post('/:gameId/trade/initiate', gameController.initiateTrade);
router.post('/:gameId/trade/offer', gameController.makeTradeOffer);
router.post('/:gameId/trade/execute', gameController.executeTrade);

export { router as gameRoutes, gameController }; 