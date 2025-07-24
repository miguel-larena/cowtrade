"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const gameRoutes_1 = require("../routes/gameRoutes");
const GameService_1 = require("../services/GameService");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/games', gameRoutes_1.gameRoutes);
const gameService = new GameService_1.GameService();
describe('Duplicate Name Handling', () => {
    let gameId;
    let player1Id;
    beforeEach(() => {
        gameService.clearAllGames();
    });
    it('should handle duplicate names by appending numbers', async () => {
        // Create a game with player "Alice"
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/games/create')
            .send({ playerName: 'Alice' })
            .expect(201);
        gameId = createResponse.body.id;
        player1Id = createResponse.body.players[0].id;
        // Try to join with the same name "Alice"
        const joinResponse1 = await (0, supertest_1.default)(app)
            .post(`/api/games/${gameId}/join`)
            .send({ playerName: 'Alice' })
            .expect(200);
        // Try to join with "Alice" again
        const joinResponse2 = await (0, supertest_1.default)(app)
            .post(`/api/games/${gameId}/join`)
            .send({ playerName: 'Alice' })
            .expect(200);
        // Check that we have three players with different names
        const gameResponse = await (0, supertest_1.default)(app)
            .get(`/api/games/${gameId}`)
            .expect(200);
        const playerNames = gameResponse.body.players.map((p) => p.name);
        expect(playerNames).toContain('Alice');
        expect(playerNames).toContain('Alice (1)');
        expect(playerNames).toContain('Alice (2)');
        expect(playerNames.length).toBe(3);
    });
    it('should allow different names without modification', async () => {
        // Create a game with player "Alice"
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/games/create')
            .send({ playerName: 'Alice' })
            .expect(201);
        gameId = createResponse.body.id;
        // Join with a different name "Bob"
        const joinResponse = await (0, supertest_1.default)(app)
            .post(`/api/games/${gameId}/join`)
            .send({ playerName: 'Bob' })
            .expect(200);
        // Check that names are unchanged
        const gameResponse = await (0, supertest_1.default)(app)
            .get(`/api/games/${gameId}`)
            .expect(200);
        const playerNames = gameResponse.body.players.map((p) => p.name);
        expect(playerNames).toContain('Alice');
        expect(playerNames).toContain('Bob');
        expect(playerNames.length).toBe(2);
    });
});
//# sourceMappingURL=duplicate-names.test.js.map