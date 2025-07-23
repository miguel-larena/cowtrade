# Kuhhandel Backend

A Node.js/Express backend for the Kuhhandel (animal trading) game.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
PORT=3001
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Game Management
- `POST /api/game/create` - Create a new game
- `GET /api/game/:gameId` - Get game state
- `POST /api/game/:gameId/join` - Join a game
- `DELETE /api/game/:gameId` - Delete a game
- `POST /api/game/:gameId/start` - Start the game

### Game Actions
- `POST /api/game/:gameId/auction/start` - Start an auction
- `POST /api/game/:gameId/auction/bid` - Place a bid
- `POST /api/game/:gameId/auction/end` - End an auction
- `POST /api/game/:gameId/auction/match` - Match a bid
- `POST /api/game/:gameId/trade/initiate` - Initiate a trade
- `POST /api/game/:gameId/trade/offer` - Make a trade offer
- `POST /api/game/:gameId/trade/execute` - Execute a trade

## Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── types/           # TypeScript types
├── utils/           # Utility functions
└── index.ts         # Main server file
```

## Development

The backend uses:
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **CORS** - Cross-origin requests
- **Nodemon** - Development server with auto-reload

## Next Steps

1. Implement full game logic (auctions, trading, etc.)
2. Add WebSocket support for real-time updates
3. Add database persistence
4. Add authentication and session management
5. Add input validation and error handling 