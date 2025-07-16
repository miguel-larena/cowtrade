import React from 'react';
import type { GameState, GamePhase } from '../types';

interface GameControlsProps {
  gameState: GameState;
  currentPlayerId: string;
  onPhaseChange: (phase: GamePhase) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  currentPlayerId,
  onPhaseChange
}) => {
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const turnPlayer = gameState.players.find(p => p.id === gameState.currentTurn);

  const getPhaseColor = (phase: GamePhase) => {
    switch (phase) {
      case 'lobby': return '#9E9E9E';
      case 'auction': return '#4CAF50';
      case 'trade': return '#2196F3';
      case 'end': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPhaseLabel = (phase: GamePhase) => {
    switch (phase) {
      case 'lobby': return 'LOBBY';
      case 'auction': return 'AUCTION';
      case 'trade': return 'TRADE';
      case 'end': return 'GAME OVER';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div style={{
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      padding: '16px',
      margin: '8px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2 style={{ 
        margin: '0 0 16px 0', 
        color: '#2c3e50',
        fontSize: 'clamp(16px, 4vw, 20px)',
        fontWeight: '600',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '8px'
      }}>
        Game Controls
      </h2>

      {/* Game Status */}
      <div style={{ 
        marginBottom: '20px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ 
            fontWeight: '600',
            color: '#495057',
            fontSize: 'clamp(11px, 2.5vw, 14px)'
          }}>Current Action:</span>
          <span style={{
            padding: '4px 12px',
            backgroundColor: getPhaseColor(gameState.currentPhase),
            color: 'white',
            borderRadius: '16px',
            fontSize: 'clamp(9px, 2vw, 12px)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {getPhaseLabel(gameState.currentPhase)}
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ 
            fontWeight: '600',
            color: '#495057',
            fontSize: 'clamp(11px, 2.5vw, 14px)'
          }}>Current Turn:</span>
          <span style={{ 
            color: '#6c757d',
            fontSize: 'clamp(11px, 2.5vw, 14px)',
            fontWeight: '500'
          }}>
            {turnPlayer?.name || 'None'}
          </span>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <span style={{ 
            fontWeight: '600',
            color: '#495057',
            fontSize: 'clamp(11px, 2.5vw, 14px)'
          }}>Your Money:</span>
          <span style={{ 
            color: '#28a745',
            fontSize: 'clamp(12px, 3vw, 16px)',
            fontWeight: 'bold'
          }}>
            ${currentPlayer?.money || 0}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 12px 0',
          color: '#2c3e50',
          fontSize: 'clamp(14px, 3.5vw, 16px)',
          fontWeight: '600'
        }}>Action</h3>
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap' 
        }}>
          <button
            onClick={() => onPhaseChange('auction')}
            disabled={gameState.currentPhase === 'auction'}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState.currentPhase === 'auction' ? '#e9ecef' : '#28a745',
              color: gameState.currentPhase === 'auction' ? '#6c757d' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: gameState.currentPhase === 'auction' ? 'not-allowed' : 'pointer',
              fontSize: 'clamp(11px, 2.5vw, 14px)',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: gameState.currentPhase === 'auction' ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (gameState.currentPhase !== 'auction') {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (gameState.currentPhase !== 'auction') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
          >
            Auction
          </button>
          <button
            onClick={() => onPhaseChange('trade')}
            disabled={gameState.currentPhase === 'trade' || gameState.auctionState !== 'none'}
            style={{
              padding: '8px 16px',
              backgroundColor: (gameState.currentPhase === 'trade' || gameState.auctionState !== 'none') ? '#e9ecef' : '#007bff',
              color: (gameState.currentPhase === 'trade' || gameState.auctionState !== 'none') ? '#6c757d' : 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (gameState.currentPhase === 'trade' || gameState.auctionState !== 'none') ? 'not-allowed' : 'pointer',
              fontSize: 'clamp(11px, 2.5vw, 14px)',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: (gameState.currentPhase === 'trade' || gameState.auctionState !== 'none') ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (gameState.currentPhase !== 'trade' && gameState.auctionState === 'none') {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (gameState.currentPhase !== 'trade' && gameState.auctionState === 'none') {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
          >
            Trade
          </button>
        </div>
      </div>

      {/* Player Info */}
      <div>
        <h3 style={{ 
          margin: '0 0 16px 0',
          color: '#2c3e50',
          fontSize: '16px',
          fontWeight: '600'
        }}>Players</h3>
        <div style={{ 
          display: 'grid', 
          gap: '8px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {gameState.players.map(player => (
            <div key={player.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: player.id === gameState.currentTurn ? '#e8f5e8' : '#ffffff',
              border: player.id === gameState.currentTurn ? '2px solid #28a745' : '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: player.id === gameState.currentTurn ? '0 2px 4px rgba(40,167,69,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <span style={{ 
                fontWeight: player.id === currentPlayerId ? 'bold' : '500',
                color: player.id === currentPlayerId ? '#2c3e50' : '#495057'
              }}>
                {player.name} {player.id === currentPlayerId && '(You)'}
                {player.id === gameState.currentTurn && (
                  <span style={{ 
                    marginLeft: '8px',
                    fontSize: '12px',
                    color: '#28a745',
                    fontWeight: 'bold'
                  }}>
                    👑
                  </span>
                )}
              </span>
              <span style={{
                color: '#28a745',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                ${player.money}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameControls; 