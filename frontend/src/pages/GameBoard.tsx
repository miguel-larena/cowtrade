import React from 'react';
import { useGameState } from '../hooks/useGameState';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import TradingPanel from '../components/TradingPanel';
import GameControls from '../components/GameControls';

const GameBoard: React.FC = () => {
  const {
    gameState,
    currentPlayerId,
    changePhase,
    nextTurn,
    handlePlaceBid,
    handleWinAuction,
    handleTradeCards,
    startGame,
    endGame,
    isCurrentPlayerTurn
  } = useGameState();

  const renderPhaseContent = () => {
    switch (gameState.currentPhase) {
      case 'lobby':
        return (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontStyle: 'italic'
          }}>
            Use the Game Controls to start the game
          </div>
        );
      
      case 'auction':
        return (
          <AuctionPanel
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPlaceBid={(amount) => handlePlaceBid(currentPlayerId, amount)}
            onWinAuction={handleWinAuction}
          />
        );
      
      case 'trade':
        return (
          <TradingPanel
            gameState={gameState}
            onTradeCards={handleTradeCards}
          />
        );
      
      case 'end':
        return (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#F44336',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Game Over! Check the final scores below.
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{ textAlign: 'center', color: '#2E7D32', marginBottom: '32px' }}>
        Kuhhandel - Game Board
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Left Sidebar - Game Controls */}
        <div style={{ order: 1 }}>
          <GameControls
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPhaseChange={changePhase}
            onNextTurn={nextTurn}
            onStartGame={startGame}
            onEndGame={endGame}
          />
        </div>

        {/* Main Content Area */}
        <div style={{ order: 2 }}>
          {/* Phase-specific content */}
          {renderPhaseContent()}

          {/* Player Hands */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginTop: '32px'
          }}>
            {gameState.players.map(player => (
              <PlayerHand 
                key={player.id} 
                player={player}
                selectable={gameState.currentPhase === 'trade'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      {gameState.currentPhase !== 'lobby' && gameState.currentPhase !== 'end' && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: isCurrentPlayerTurn(currentPlayerId) ? '#4CAF50' : '#FF9800',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          {isCurrentPlayerTurn(currentPlayerId) ? 'Your Turn!' : `${gameState.players.find(p => p.id === gameState.currentTurn)?.name}'s Turn`}
        </div>
      )}
    </div>
  );
};

export default GameBoard;