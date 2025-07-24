import React from 'react';
import type { GameState } from '../types';

interface GameControlsProps {
  gameState: GameState;
  currentPlayerId: string;
  onRefreshGameState: () => Promise<void>;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  currentPlayerId,
  onRefreshGameState
}) => {
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const turnPlayer = gameState.players.find(p => p.id === gameState.currentTurn);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'lobby': return '#9E9E9E';
      case 'auction': return '#4CAF50';
      case 'trade': return '#2196F3';
      case 'end': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPhaseLabel = (phase: string) => {
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
            color: '#2c3e50',
            fontSize: 'clamp(11px, 2.5vw, 14px)',
            fontWeight: '500'
          }}>
            {turnPlayer?.name || 'Unknown'}
          </span>
        </div>

        {currentPlayer && (
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
              fontSize: 'clamp(11px, 2.5vw, 14px)',
              fontWeight: 'bold'
            }}>
              ${currentPlayer.money}
            </span>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onRefreshGameState}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          🔄 Refresh Game State
        </button>
      </div>
    </div>
  );
};

export default GameControls; 