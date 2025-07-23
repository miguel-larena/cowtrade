import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Lobby from './pages/Lobby';
import GameBoard from './pages/GameBoard';

function App() {
  const navigate = useNavigate();

  const handleGameStart = () => {
    // Navigate to the game board
    navigate('/game');
  };

  const handleBackToLobby = () => {
    // Navigate back to lobby
    navigate('/');
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
          <Lobby onGameStart={handleGameStart} />
        } />
        <Route path="/game" element={
          <GameBoard onBackToLobby={handleBackToLobby} />
        } />
      </Routes>
    </div>
  )
}

export default App
