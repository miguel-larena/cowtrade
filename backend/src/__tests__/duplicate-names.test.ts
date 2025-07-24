import request from 'supertest';
import express from 'express';
import { gameRoutes } from '../routes/gameRoutes';
import { GameService } from '../services/GameService';

const app = express();
app.use(express.json());
app.use('/api/games', gameRoutes);

const gameService = new GameService();

describe('Duplicate Name Handling', () => {
  let gameId: string;
  let player1Id: string;

  beforeEach(() => {
    gameService.clearAllGames();
  });

  it('should handle duplicate names by appending numbers', async () => {
    // Create a game with player "Alice"
    const createResponse = await request(app)
      .post('/api/games/create')
      .send({ playerName: 'Alice' })
      .expect(201);

    gameId = createResponse.body.id;
    player1Id = createResponse.body.players[0].id;

    // Try to join with the same name "Alice"
    const joinResponse1 = await request(app)
      .post(`/api/games/${gameId}/join`)
      .send({ playerName: 'Alice' })
      .expect(200);

    // Try to join with "Alice" again
    const joinResponse2 = await request(app)
      .post(`/api/games/${gameId}/join`)
      .send({ playerName: 'Alice' })
      .expect(200);

    // Check that we have three players with different names
    const gameResponse = await request(app)
      .get(`/api/games/${gameId}`)
      .expect(200);

    const playerNames = gameResponse.body.players.map((p: any) => p.name);
    expect(playerNames).toContain('Alice');
    expect(playerNames).toContain('Alice (1)');
    expect(playerNames).toContain('Alice (2)');
    expect(playerNames.length).toBe(3);
  });

  it('should allow different names without modification', async () => {
    // Create a game with player "Alice"
    const createResponse = await request(app)
      .post('/api/games/create')
      .send({ playerName: 'Alice' })
      .expect(201);

    gameId = createResponse.body.id;

    // Join with a different name "Bob"
    const joinResponse = await request(app)
      .post(`/api/games/${gameId}/join`)
      .send({ playerName: 'Bob' })
      .expect(200);

    // Check that names are unchanged
    const gameResponse = await request(app)
      .get(`/api/games/${gameId}`)
      .expect(200);

    const playerNames = gameResponse.body.players.map((p: any) => p.name);
    expect(playerNames).toContain('Alice');
    expect(playerNames).toContain('Bob');
    expect(playerNames.length).toBe(2);
  });
}); 