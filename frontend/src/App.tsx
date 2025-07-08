import { Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Lobby from './pages/Lobby';
import GameBoard from './pages/GameBoard';
import type { Player } from './types';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId] = useState<string>('player1');

  const handleAddPlayer = (name: string) => {
    const newPlayer: Player = {
      id: `player${players.length + 1}`,
      name,
      hand: [],
      money: 100
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const handleStartGame = () => {
    // For now, just navigate to game board
    // In a real app, you'd initialize the game state here
    console.log('Starting game with players:', players);
  };

  return (
    <div>
      <nav>
        <Link to="/">Lobby</Link> | <Link to="/game">Game Board</Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <Lobby 
            players={players}
            onStartGame={handleStartGame}
            onAddPlayer={handleAddPlayer}
            currentPlayerId={currentPlayerId}
          />
        } />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </div>
  )
}

export default App
