import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useGameState } from './hooks/useGameState';
import Lobby from './pages/Lobby';
import GameBoard from './pages/GameBoard';

function App() {
  const {
    gameState,
    currentPlayerId,
    addPlayer,
    startGame,
    changePhase,
    nextTurn,
    handlePlaceBid,
    handleWinAuction,
    handleTradeCards,
    endGame,
    isCurrentPlayerTurn,
    startAuction,
    placeBidInAuction,
    endAuction
  } = useGameState();

  const navigate = useNavigate();

  const handleStartGame = () => {
    startGame();
    // Navigate to the game board
    navigate('/game');
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
        <Route path="/game" element={
          <GameBoard 
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPhaseChange={changePhase}
            onNextTurn={nextTurn}
            onPlaceBid={handlePlaceBid}
            onWinAuction={handleWinAuction}
            onTradeCards={handleTradeCards}
            onStartGame={startGame}
            onEndGame={endGame}
            isCurrentPlayerTurn={isCurrentPlayerTurn}
            onStartAuction={startAuction}
            onPlaceBidInAuction={placeBidInAuction}
            onEndAuction={endAuction}
          />
        } />
      </Routes>
    </div>
  )
}

export default App
