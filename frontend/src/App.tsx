import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useGameState } from './hooks/useGameState';
import Lobby from './pages/Lobby';
import GameBoard from './pages/GameBoard';

function App() {
  const navigate = useNavigate();



  const {
    gameState,
    loading,
    error,
    currentPlayerId,
    gameId,
    createGame,
    joinGame,
    startGame,
    leaveGame,
    deleteGame,
    startAuction,
    placeBid,
    endAuction,
    matchBid,
    clearAuctionSummary,
    restartAuctionAfterBluff,
    initiateTrade,
    makeTradeOffer,
    executeTrade,
    refreshGameState
  } = useGameState();

  const handleStartGame = async () => {
    if (gameState) {
      await startGame();
      // Navigate to the game board
      navigate('/game');
    }
  };

  const handleLeaveGame = async () => {
    await leaveGame();
    // Navigate back to lobby
    navigate('/');
  };

  const handleEndGame = async () => {
    await deleteGame();
    // Navigate back to lobby
    navigate('/');
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ color: 'red', fontSize: '18px' }}>Error: {error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

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
        {gameState && (
          <Link to="/game" style={{ textDecoration: 'none', color: '#2196F3' }}>
            Game Board
          </Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={
          <Lobby 
            gameState={gameState}
            onCreateGame={createGame}
            onJoinGame={joinGame}
            onStartGame={handleStartGame}
            onLeaveGame={handleLeaveGame}
            onEndGame={handleEndGame}
            currentPlayerId={currentPlayerId}
            gameId={gameId}
          />
        } />
        <Route path="/game" element={
          gameState ? (
            <GameBoard 
              gameState={gameState}
              currentPlayerId={currentPlayerId}
              onStartAuction={startAuction}
              onPlaceBid={placeBid}
              onEndAuction={endAuction}
              onMatchBid={matchBid}
              onClearAuctionSummary={clearAuctionSummary}
              onRestartAuctionAfterBluff={restartAuctionAfterBluff}
              onInitiateTrade={initiateTrade}
              onMakeTradeOffer={makeTradeOffer}
              onExecuteTrade={executeTrade}
              onRefreshGameState={refreshGameState}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '50vh',
              fontSize: '18px'
            }}>
              No game in progress. Please create or join a game.
            </div>
          )
        } />
      </Routes>
    </div>
  )
}

export default App
