import React from 'react';
import type { GameState, GamePhase } from '../types';

interface GameControlsProps {
  gameState: GameState;
  currentPlayerId: string;
  onPhaseChange: (phase: GamePhase) => void;
  onNextTurn: () => void;
  onStartGame: () => void;
  onEndGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  currentPlayerId,
  onPhaseChange,
  onNextTurn,
  onStartGame,
  onEndGame
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

  return (
    <div style={{
      border: '2px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px',
      backgroundColor: '#fafafa'
    }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>
        Game Controls
      </h2>

      {/* Game Status */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: 'bold' }}>Current Phase:</span>
          <span style={{
            padding: '4px 12px',
            backgroundColor: getPhaseColor(gameState.currentPhase),
            color: 'white',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {gameState.currentPhase.toUpperCase()}
          </span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: 'bold' }}>Current Turn:</span>
          <span style={{ color: '#666' }}>
            {turnPlayer?.name || 'None'}
          </span>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold' }}>Your Money:</span>
          <span style={{ color: '#666' }}>
            ${currentPlayer?.money || 0}
          </span>
        </div>
      </div>

      {/* Phase Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Phase Management</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onPhaseChange('lobby')}
            disabled={gameState.currentPhase === 'lobby'}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState.currentPhase === 'lobby' ? '#ccc' : '#9E9E9E',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: gameState.currentPhase === 'lobby' ? 'not-allowed' : 'pointer'
            }}
          >
            Lobby
          </button>
          <button
            onClick={() => onPhaseChange('auction')}
            disabled={gameState.currentPhase === 'auction'}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState.currentPhase === 'auction' ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: gameState.currentPhase === 'auction' ? 'not-allowed' : 'pointer'
            }}
          >
            Auction
          </button>
          <button
            onClick={() => onPhaseChange('trade')}
            disabled={gameState.currentPhase === 'trade'}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState.currentPhase === 'trade' ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: gameState.currentPhase === 'trade' ? 'not-allowed' : 'pointer'
            }}
          >
            Trade
          </button>
          <button
            onClick={() => onPhaseChange('end')}
            disabled={gameState.currentPhase === 'end'}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState.currentPhase === 'end' ? '#ccc' : '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: gameState.currentPhase === 'end' ? 'not-allowed' : 'pointer'
            }}
          >
            End
          </button>
        </div>
      </div>

      {/* Game Flow Controls */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Game Flow</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onStartGame}
            disabled={gameState.currentPhase !== 'lobby'}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState.currentPhase === 'lobby' ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: gameState.currentPhase === 'lobby' ? 'pointer' : 'not-allowed'
            }}
          >
            Start Game
          </button>
          <button
            onClick={onNextTurn}
            disabled={gameState.currentPhase === 'lobby' || gameState.currentPhase === 'end'}
            style={{
              padding: '8px 16px',
              backgroundColor: (gameState.currentPhase !== 'lobby' && gameState.currentPhase !== 'end') ? '#FF9800' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (gameState.currentPhase !== 'lobby' && gameState.currentPhase !== 'end') ? 'pointer' : 'not-allowed'
            }}
          >
            Next Turn
          </button>
          <button
            onClick={onEndGame}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            End Game
          </button>
        </div>
      </div>

      {/* Player Info */}
      <div>
        <h3 style={{ margin: '0 0 12px 0' }}>Players</h3>
        <div style={{ display: 'grid', gap: '4px' }}>
          {gameState.players.map(player => (
            <div key={player.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '4px 8px',
              backgroundColor: player.id === gameState.currentTurn ? '#e8f5e8' : 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <span style={{ fontWeight: player.id === currentPlayerId ? 'bold' : 'normal' }}>
                {player.name} {player.id === currentPlayerId && '(You)'}
              </span>
              <span>${player.money}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameControls; 