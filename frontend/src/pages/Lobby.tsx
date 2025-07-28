import React, { useState } from 'react';
import type { GameState } from '../types';

interface LobbyProps {
  gameState: GameState | null;
  onCreateGame: (playerName: string) => Promise<void>;
  onJoinGame: (gameId: string, playerName: string) => Promise<void>;
  onStartGame?: () => void;
  onLeaveGame?: () => void;
  onEndGame?: () => void;
  currentPlayerId?: string | null;
  gameId?: string | null;
}

const Lobby: React.FC<LobbyProps> = ({ 
  gameState, 
  onCreateGame,
  onJoinGame,
  onStartGame,
  onLeaveGame,
  onEndGame,
  currentPlayerId,
  gameId
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [showJoinGame, setShowJoinGame] = useState(false);
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGame = async () => {
    const trimmedName = newPlayerName.trim();
    
    if (!trimmedName) {
      setNameError('Player name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    try {
      await onCreateGame(trimmedName);
      setNewPlayerName('');
      setShowCreateGame(false);
      setNameError('');
    } catch (error) {
      setNameError('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    const trimmedName = newPlayerName.trim();
    const trimmedGameId = gameIdToJoin.trim();
    
    if (!trimmedName) {
      setNameError('Player name cannot be empty');
      return;
    }
    
    if (!trimmedGameId) {
      setNameError('Game ID cannot be empty');
      return;
    }
    
    setIsLoading(true);
    try {
      await onJoinGame(trimmedGameId, trimmedName);
      setNewPlayerName('');
      setGameIdToJoin('');
      setShowJoinGame(false);
      setNameError('');
    } catch (error) {
      setNameError('Failed to join game. Please check the game ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const players = gameState?.players || [];
  const isGameCreator = gameState && currentPlayerId && players.length > 0 && players[0].id === currentPlayerId;
  const canStartGame = gameState && players.length >= 2 && gameState.currentPhase === 'lobby' && isGameCreator;
  const canLeaveGame = gameState && currentPlayerId && !isGameCreator && gameState.currentPhase === 'lobby';
  const canEndGame = gameState && isGameCreator && gameState.currentPhase === 'lobby';

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

      {!gameState ? (
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
            Welcome to Kuhhandel!
          </h2>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setShowCreateGame(true);
                setShowJoinGame(false);
                setNewPlayerName('');
                setGameIdToJoin('');
                setNameError('');
              }}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Create New Game
            </button>
            
            <button
              onClick={() => {
                setShowJoinGame(true);
                setShowCreateGame(false);
                setNewPlayerName('');
                setGameIdToJoin('');
                setNameError('');
              }}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Join Existing Game
            </button>
          </div>

          {showCreateGame && (
            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3>Create New Game</h3>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              {nameError && <div style={{ color: 'red', marginBottom: '8px' }}>{nameError}</div>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCreateGame}
                  disabled={isLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create Game'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateGame(false);
                    setNewPlayerName('');
                    setNameError('');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showJoinGame && (
            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
              <h3>Join Existing Game</h3>
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Enter game ID"
                  value={gameIdToJoin}
                  onChange={(e) => setGameIdToJoin(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              {nameError && <div style={{ color: 'red', marginBottom: '8px' }}>{nameError}</div>}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleJoinGame}
                  disabled={isLoading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Joining...' : 'Join Game'}
                </button>
                <button
                  onClick={() => {
                    setShowJoinGame(false);
                    setNewPlayerName('');
                    setGameIdToJoin('');
                    setNameError('');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '600',
            borderBottom: '2px solid #ecf0f1',
            paddingBottom: '12px'
          }}>
            Players ({players.length}/6)
          </h2>
          
          <div style={{
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#6c757d',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              Game ID
            </div>
            <div style={{
              fontSize: '18px',
              fontFamily: 'monospace',
              color: '#2c3e50',
              fontWeight: '600',
              backgroundColor: '#ffffff',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #dee2e6',
              letterSpacing: '0.5px'
            }}>
              {gameId}
            </div>
          </div>
          
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
              No players have joined yet. Share the game ID with others to start playing!
            </div>
          ) : (
            <div style={{ marginBottom: '20px' }}>
              {players.map((player, index) => (
                <div key={player.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#3498db',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>
                    {player.name}
                    {player.id === currentPlayerId && (
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '12px', 
                        backgroundColor: '#27ae60', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '4px' 
                      }}>
                        You
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {canStartGame && onStartGame && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={onStartGame}
                style={{
                  padding: '12px 32px',
                  fontSize: '18px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Start Game
              </button>
            </div>
          )}

          {/* Game Control Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center', 
            marginTop: '16px' 
          }}>
            {canLeaveGame && onLeaveGame && (
              <button
                onClick={onLeaveGame}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Leave Game
              </button>
            )}

            {canEndGame && onEndGame && (
              <button
                onClick={onEndGame}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                End Game
              </button>
            )}
          </div>

          {gameState.currentPhase !== 'lobby' && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px', 
              backgroundColor: '#e8f5e8', 
              borderRadius: '8px',
              marginTop: '16px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60', marginBottom: '8px' }}>
                Game in Progress
              </div>
              <div style={{ color: '#2c3e50' }}>
                The game has started! Use the Game Board link above to join the action.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Lobby;