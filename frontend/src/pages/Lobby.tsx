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
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#2E7D32',
        marginBottom: '30px',
        fontSize: '32px'
      }}>
        Kuhhandel - Game Lobby
      </h1>

      <div style={{
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#333' }}>Players ({players.length})</h2>
        
        {players.length === 0 ? (
          <div style={{ 
            color: '#555', 
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px',
            fontSize: '16px'
          }}>
            No players yet. Add some players to start!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {players.map((player, index) => (
              <div key={player.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: player.id === currentPlayerId ? '#e8f5e8' : 'white',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#333' }}>
                    {index + 1}. {player.name}
                  </span>
                  {player.id === currentPlayerId && (
                    <span style={{ 
                      marginLeft: '8px',
                      fontSize: '12px',
                      color: '#4CAF50',
                      fontWeight: 'bold'
                    }}>
                      (You)
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: '#555', fontWeight: 'bold' }}>
                  Money: ${player.money}
                </div>
              </div>
            ))}
          </div>
        )}

        {canAddPlayer && !showAddPlayer && (
          <button
            onClick={() => setShowAddPlayer(true)}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Add Player
          </button>
        )}

        {canAddPlayer && showAddPlayer && (
          <div style={{ marginTop: '16px' }}>
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => {
                setNewPlayerName(e.target.value);
                setNameError(''); // Clear error when user types
              }}
              placeholder="Enter player name"
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: nameError ? '1px solid #f44336' : '1px solid #ccc',
                marginRight: '8px',
                width: '200px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: newPlayerName.trim() ? '#4CAF50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: newPlayerName.trim() ? 'pointer' : 'not-allowed',
                marginRight: '8px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddPlayer(false);
                setNewPlayerName('');
                setNameError('');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
            {nameError && (
              <div style={{
                color: '#f44336',
                fontSize: '12px',
                marginTop: '4px',
                fontWeight: 'bold'
              }}>
                {nameError}
              </div>
            )}
          </div>
        )}

        {!canAddPlayer && (
          <div style={{
            textAlign: 'center',
            marginTop: '12px',
            color: '#FF9800',
            fontStyle: 'italic',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            Maximum of 6 players reached
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onStartGame}
          disabled={!canStartGame}
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            backgroundColor: canStartGame ? '#4CAF50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: canStartGame ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          {canStartGame ? 'Start Game' : 'Need at least 2 players'}
        </button>
      </div>

      {!canStartGame && (
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          color: '#555',
          fontStyle: 'italic',
          fontSize: '16px'
        }}>
          Add at least 2 players to start the game
        </div>
      )}
    </div>
  );
};

export default Lobby;