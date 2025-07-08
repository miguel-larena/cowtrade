import { Routes, Route, Link } from 'react-router-dom';
import { useGameState } from './hooks/useGameState';
import Lobby from './pages/Lobby';
import GameBoard from './pages/GameBoard';

function App() {
  const {
    gameState,
    currentPlayerId,
    addPlayer,
    startGame
  } = useGameState();

  const handleStartGame = () => {
    startGame();
    // In a real app, you might navigate to the game board here
    console.log('Starting game with players:', gameState.players);
  };

  return (
    <div>
      <nav style={{
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <Link to="/" style={{ marginRight: '16px', textDecoration: 'none', color: '#2196F3' }}>
          Lobby
        </Link>
        <Link to="/game" style={{ textDecoration: 'none', color: '#2196F3' }}>
          Game Board
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={
          <Lobby 
            players={gameState.players}
            onStartGame={handleStartGame}
            onAddPlayer={addPlayer}
            currentPlayerId={currentPlayerId}
          />
        } />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </div>
  )
}

export default App
