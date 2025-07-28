"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameController = exports.gameRoutes = void 0;
const express_1 = require("express");
const GameController_1 = require("../controllers/GameController");
const router = (0, express_1.Router)();
exports.gameRoutes = router;
const gameController = new GameController_1.GameController();
exports.gameController = gameController;
// Game management endpoints
router.post('/create', gameController.createGame);
router.get('/:gameId', gameController.getGame);
router.post('/:gameId/join', gameController.joinGame);
router.post('/:gameId/leave', gameController.leaveGame);
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
//# sourceMappingURL=gameRoutes.js.map