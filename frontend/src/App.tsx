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
    endGame,
    isCurrentPlayerTurn,
    startAuction,
    placeBidInAuction,
    endAuction,
    matchBid,
    emptyDeck,
    addAnimalCards,
    initiateTrade,
    selectTradePartner,
    selectAnimalCardsForTrade,
    makeTradeOffer,
    confirmTrade,
    executeTrade,
    cancelTrade,
    restartTradeAfterTie
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
            onStartGame={startGame}
            onEndGame={endGame}
            isCurrentPlayerTurn={isCurrentPlayerTurn}
            onStartAuction={startAuction}
            onPlaceBidInAuction={placeBidInAuction}
            onEndAuction={endAuction}
            onMatchBid={matchBid}
            onEmptyDeck={emptyDeck}
            onAddAnimalCards={addAnimalCards}
            onInitiateTrade={initiateTrade}
            onSelectTradePartner={selectTradePartner}
            onSelectAnimalCardsForTrade={selectAnimalCardsForTrade}
            onMakeTradeOffer={makeTradeOffer}
            onConfirmTrade={confirmTrade}
            onExecuteTrade={executeTrade}
            onCancelTrade={cancelTrade}
            onRestartTradeAfterTie={restartTradeAfterTie}
          />
        } />
      </Routes>
    </div>
  )
}

export default App
