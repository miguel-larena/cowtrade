import React, { useState } from 'react';
import type { Player } from '../types';

interface LobbyProps {
  players: Player[];
  onStartGame?: () => void;
  onAddPlayer?: (name: string) => void;
  currentPlayerId?: string;
}

const Lobby: React.FC<LobbyProps> = ({ 
  players, 
  onStartGame, 
  onAddPlayer,
  currentPlayerId 
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleAddPlayer = () => {
    const trimmedName = newPlayerName.trim();
    
    if (!trimmedName) {
      setNameError('Player name cannot be empty');
      return;
    }
    
    // Check for duplicate names (case-insensitive)
    const isDuplicate = players.some(player => 
      player.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      setNameError('A player with this name already exists');
      return;
    }
    
    if (onAddPlayer) {
      onAddPlayer(trimmedName);
      setNewPlayerName('');
      setShowAddPlayer(false);
      setNameError('');
    }
  };

  const canStartGame = players.length >= 2;
  const canAddPlayer = players.length < 6;

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '32px 24px',
      fontFamily: 'Arial, sans-serif',
      color: '#2c3e50',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#2c3e50',
        marginBottom: '40px',
        fontSize: '36px',
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        🐟 Kuhhandel - Game Lobby
      </h1>

      <div style={{
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          color: '#2c3e50',
          fontSize: '24px',
          fontWeight: '600',
          borderBottom: '2px solid #ecf0f1',
          paddingBottom: '12px'
        }}>
          Players ({players.length}/6)
        </h2>
        
        {players.length === 0 ? (
          <div style={{ 
            color: '#6c757d', 
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '40px 20px',
            fontSize: '18px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
            No players yet. Add some players to start!
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gap: '12px',
            marginBottom: '20px'
          }}>
            {players.map((player, index) => (
              <div key={player.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: player.id === currentPlayerId ? '#e8f5e8' : '#ffffff',
                border: player.id === currentPlayerId ? '2px solid #28a745' : '1px solid #dee2e6',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                boxShadow: player.id === currentPlayerId ? '0 2px 4px rgba(40,167,69,0.2)' : '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    fontSize: '16px',
                    marginRight: '8px'
                  }}>
                    {index + 1}.
                  </span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    fontSize: '16px'
                  }}>
                    {player.name}
                  </span>
                  {player.id === currentPlayerId && (
                    <span style={{ 
                      marginLeft: '12px',
                      fontSize: '12px',
                      color: '#28a745',
                      fontWeight: 'bold',
                      backgroundColor: '#d4edda',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      YOU
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#28a745', 
                  fontWeight: 'bold' 
                }}>
                  ${player.money}
                </div>
              </div>
            ))}
          </div>
        )}

        {canAddPlayer && !showAddPlayer && (
          <button
            onClick={() => setShowAddPlayer(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            ➕ Add Player
          </button>
        )}

        {canAddPlayer && showAddPlayer && (
          <div style={{ 
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => {
                  setNewPlayerName(e.target.value);
                  setNameError(''); // Clear error when user types
                }}
                placeholder="Enter player name"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: nameError ? '2px solid #dc3545' : '1px solid #ced4da',
                  width: '250px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = nameError ? '#dc3545' : '#ced4da';
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: newPlayerName.trim() ? '#28a745' : '#e9ecef',
                  color: newPlayerName.trim() ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: newPlayerName.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: newPlayerName.trim() ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (newPlayerName.trim()) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (newPlayerName.trim()) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }
                }}
              >
                ✅ Add
              </button>
              <button
                onClick={() => {
                  setShowAddPlayer(false);
                  setNewPlayerName('');
                  setNameError('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                ❌ Cancel
              </button>
            </div>
            {nameError && (
              <div style={{
                color: '#dc3545',
                fontSize: '14px',
                marginTop: '8px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ⚠️ {nameError}
              </div>
            )}
          </div>
        )}

        {!canAddPlayer && (
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            color: '#ffc107',
            fontStyle: 'italic',
            fontSize: '14px',
            fontWeight: '600',
            padding: '12px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            🚫 Maximum of 6 players reached
          </div>
        )}
      </div>

      <div style={{ 
        textAlign: 'center',
        marginTop: '32px'
      }}>
        <button
          onClick={onStartGame}
          disabled={!canStartGame}
          style={{
            padding: '20px 40px',
            fontSize: '20px',
            backgroundColor: canStartGame ? '#28a745' : '#e9ecef',
            color: canStartGame ? 'white' : '#6c757d',
            border: 'none',
            borderRadius: '12px',
            cursor: canStartGame ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
            boxShadow: canStartGame ? '0 4px 12px rgba(40,167,69,0.3)' : 'none',
            minWidth: '200px'
          }}
          onMouseEnter={(e) => {
            if (canStartGame) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(40,167,69,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (canStartGame) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.3)';
            }
          }}
        >
          {canStartGame ? '🎮 Start Game' : 'Need at least 2 players'}
        </button>
      </div>

      {!canStartGame && (
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          color: '#6c757d',
          fontStyle: 'italic',
          fontSize: '16px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          📝 Add at least 2 players to start the game
        </div>
      )}
    </div>
  );
};

export default Lobby;