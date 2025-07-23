# Kuhhandel Backend

Backend server for the Kuhhandel card game built with Node.js, Express, and TypeScript.

## Features

- Game state management
- Auction system with bidding and bluffing
- Trading system
- Tuna bonus mechanics
- RESTful API endpoints
- CORS support for frontend integration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration.

3. **Development mode:**
   ```bash
   npm run dev
   ```

4. **Production build:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Games
- `POST /api/games/create` - Create a new game
- `GET /api/games` - Get all active games
- `GET /api/games/:gameId` - Get game state
- `DELETE /api/games/:gameId` - Delete a game

### Auctions
- `POST /api/games/:gameId/auction/start` - Start an auction
- `POST /api/games/:gameId/auction/bid` - Place a bid

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

## Project Structure

```
src/
├── types.ts          # TypeScript type definitions
├── gameData.ts       # Game data (cards, players)
├── gameManager.ts    # Game state management
├── app.ts           # Express application setup
└── routes/
    └── gameRoutes.ts # API route handlers
```

## Development

The backend uses:
- **Express** for the web server
- **TypeScript** for type safety
- **CORS** for cross-origin requests
- **Nodemon** for development auto-reload

## Next Steps

- Add WebSocket support for real-time updates
- Implement database persistence
- Add authentication and user management
- Add more game mechanics (end game conditions, scoring) 