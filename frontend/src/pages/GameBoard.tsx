import React, { useState } from 'react';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import TradingPanel from '../components/TradingPanel';
import GameControls from '../components/GameControls';
import Scoreboard from '../components/Scoreboard';
import { useGameState } from '../hooks/useGameState';


interface GameBoardProps {
  onBackToLobby: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ onBackToLobby }) => {
  const { 
    gameState, 
    currentPlayerId, 
    loading, 
    error, 
    startAuction, 
    placeBid, 
    clearError 
  } = useGameState();
  
  const [testPlayerId, setTestPlayerId] = useState(currentPlayerId);

  // Update testPlayerId when currentPlayerId changes
  React.useEffect(() => {
    setTestPlayerId(currentPlayerId);
  }, [currentPlayerId]);

  if (!gameState) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6c757d'
      }}>
        {loading ? '🔄 Loading game...' : 'No game state available'}
      </div>
    );
  }

  const renderPhaseContent = () => {
    switch (gameState.currentPhase) {
      case 'lobby':
        return (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#6c757d',
            fontStyle: 'italic',
            fontSize: '18px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🎮</div>
            Use the Game Controls to start the game
          </div>
        );
      
      case 'auction':
        return (
          <div>
            <AuctionPanel
              gameState={gameState}
              currentPlayerId={testPlayerId}
              onStartAuction={startAuction}
              onPlaceBid={placeBid}
              onEndAuction={() => {}} // TODO: Implement auction end logic
              onMatchBid={() => {}} // TODO: Implement match bid logic
              onClearAuctionSummary={() => {}} // TODO: Implement clear summary logic
              onRestartAuctionAfterBluff={() => {}} // TODO: Implement restart logic
            />
          </div>
        );
      
      case 'trade':
        return (
          <TradingPanel
            gameState={gameState}
            currentPlayerId={testPlayerId}
            onInitiateTrade={() => {}} // TODO: Implement trade logic
            onSelectTradePartner={() => {}} // TODO: Implement partner selection
            onSelectAnimalCardsForTrade={() => {}} // TODO: Implement card selection
            onMakeTradeOffer={() => {}} // TODO: Implement trade offers
            onConfirmTrade={() => {}} // TODO: Implement trade confirmation
            onExecuteTrade={() => {}} // TODO: Implement trade execution
            onCancelTrade={() => {}} // TODO: Implement trade cancellation
            onRestartTradeAfterTie={() => {}} // TODO: Implement tie restart
          />
        );
      
      case 'end':
        return (
          <Scoreboard 
            players={gameState.players} 
          />
        );
      
      default:
        return (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            Unknown phase: {gameState.currentPhase}
          </div>
        );
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#2c3e50',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #f5c6cb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              color: '#721c24',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h1 style={{ 
            margin: '0 0 24px 0', 
            color: '#2c3e50',
            fontSize: '28px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            🐟 Kuhhandel
          </h1>
          
          {renderPhaseContent()}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <GameControls
            gameState={gameState}
            currentPlayerId={testPlayerId}
            onPhaseChange={() => {}} // TODO: Implement phase change
          />

          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#2c3e50',
              fontSize: '18px',
              fontWeight: '600',
              borderBottom: '2px solid #ecf0f1',
              paddingBottom: '8px'
            }}>
              Player Selection
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#495057'
              }}>
                Current Player:
              </label>
              <select
                value={testPlayerId}
                onChange={(e) => setTestPlayerId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ced4da',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  outline: 'none'
                }}
              >
                {gameState.players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onBackToLobby}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a6268';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d';
              }}
            >
              ← Back to Lobby
            </button>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {gameState.players.map(player => (
          <PlayerHand
            key={player.id}
            player={player}
            currentPlayerId={testPlayerId}
            onCardClick={() => {}} // TODO: Implement card selection
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;