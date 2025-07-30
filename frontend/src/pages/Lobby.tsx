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
  const [createGameName, setCreateGameName] = useState('');
  const [joinGameName, setJoinGameName] = useState('');
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [createGameError, setCreateGameError] = useState('');
  const [joinGameError, setJoinGameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCreateGame = async () => {
    const trimmedName = createGameName.trim();
    
    if (!trimmedName) {
      setCreateGameError('Player name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    try {
      await onCreateGame(trimmedName);
      setCreateGameName('');
      setCreateGameError('');
    } catch (error) {
      setCreateGameError('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    const trimmedName = joinGameName.trim();
    const trimmedGameId = gameIdToJoin.trim();
    
    if (!trimmedName) {
      setJoinGameError('Player name cannot be empty');
      return;
    }
    
    if (!trimmedGameId) {
      setJoinGameError('Game ID cannot be empty');
      return;
    }
    
    setIsLoading(true);
    try {
      await onJoinGame(trimmedGameId, trimmedName);
      setJoinGameName('');
      setGameIdToJoin('');
      setJoinGameError('');
    } catch (error) {
      setJoinGameError('Failed to join game. Please check the game ID and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyGameId = async () => {
    if (!gameId) return;
    
    try {
      await navigator.clipboard.writeText(gameId);
      setCopySuccess(true);
      // Reset success message after 1.5 seconds for better UX
      setTimeout(() => setCopySuccess(false), 1500);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = gameId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    }
  };

  const players = gameState?.players || [];
  const isGameCreator = gameState && currentPlayerId && players.length > 0 && players[0].id === currentPlayerId;
  const canStartGame = gameState && players.length >= 2 && gameState.currentPhase === 'lobby' && isGameCreator;
  const canLeaveGame = gameState && currentPlayerId && !isGameCreator && gameState.currentPhase === 'lobby';
  const canEndGame = gameState && isGameCreator && gameState.currentPhase === 'lobby';

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      color: '#2c3e50',
      backgroundColor: '#f8f9fa',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#2c3e50',
        marginBottom: 'clamp(24px, 6vw, 40px)',
        fontSize: 'clamp(24px, 6vw, 36px)',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ fontSize: 'clamp(32px, 8vw, 48px)', marginBottom: '8px' }}>🐟</div>
        <div>None of Your Fishiness</div>
      </h1>

      {!gameState ? (
        <div style={{
          width: '100%',
          maxWidth: 'clamp(600px, 90vw, 1200px)',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(16px, 4vw, 24px)'
        }}>
          {/* Create Game Section */}
          <div style={{
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            padding: 'clamp(20px, 4vw, 32px)',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              margin: '0 0 clamp(16px, 3vw, 24px) 0', 
              color: '#2c3e50',
              fontSize: 'clamp(20px, 4vw, 24px)',
              fontWeight: '600',
              borderBottom: '2px solid #ecf0f1',
              paddingBottom: '12px',
              textAlign: 'center'
            }}>
              Create New Game
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057'
              }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={createGameName}
                onChange={(e) => setCreateGameName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {createGameError && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>{createGameError}</div>}
            
            <button
              onClick={handleCreateGame}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                fontWeight: '600',
                transition: 'background-color 0.2s ease'
              }}
            >
              {isLoading ? 'Creating...' : 'Create New Game'}
            </button>
          </div>

          {/* OR Separator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '8px 0'
          }}>
            <div style={{
              flex: '1',
              height: '1px',
              backgroundColor: '#e0e0e0'
            }} />
            <div style={{
              padding: '0 16px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#6c757d',
              backgroundColor: '#f8f9fa'
            }}>
              or
            </div>
            <div style={{
              flex: '1',
              height: '1px',
              backgroundColor: '#e0e0e0'
            }} />
          </div>

          {/* Join Game Section */}
          <div style={{
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            padding: 'clamp(20px, 4vw, 32px)',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              margin: '0 0 clamp(16px, 3vw, 24px) 0', 
              color: '#2c3e50',
              fontSize: 'clamp(20px, 4vw, 24px)',
              fontWeight: '600',
              borderBottom: '2px solid #ecf0f1',
              paddingBottom: '12px',
              textAlign: 'center'
            }}>
              Join Existing Game
            </h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057'
              }}>
                Game ID
              </label>
              <input
                type="text"
                placeholder="Enter game ID"
                value={gameIdToJoin}
                onChange={(e) => setGameIdToJoin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057'
              }}>
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={joinGameName}
                onChange={(e) => setJoinGameName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {joinGameError && <div style={{ color: 'red', marginBottom: '16px', fontSize: '14px' }}>{joinGameError}</div>}
            
            <button
              onClick={handleJoinGame}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                fontWeight: '600',
                transition: 'background-color 0.2s ease'
              }}
            >
              {isLoading ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: 'clamp(16px, 3vw, 24px)',
          marginBottom: 'clamp(16px, 3vw, 24px)',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '100%'
        }}>
          <h2 style={{ 
            margin: '0 0 clamp(12px, 2vw, 16px) 0', 
            color: '#2c3e50',
            fontSize: 'clamp(20px, 4vw, 24px)',
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
              marginBottom: '8px'
            }}>
              Game ID
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{
                fontSize: 'clamp(14px, 3vw, 18px)',
                fontFamily: 'monospace',
                color: '#2c3e50',
                fontWeight: '600',
                backgroundColor: '#ffffff',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                letterSpacing: '0.5px',
                flex: '1',
                minWidth: '200px',
                maxWidth: 'clamp(250px, 50vw, 400px)',
                wordBreak: 'break-all'
              }}>
                {gameId}
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={handleCopyGameId}
                  style={{
                    padding: '8px',
                    fontSize: '16px',
                    backgroundColor: 'transparent',
                    color: copySuccess ? '#27ae60' : '#6c757d',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const tooltip = e.currentTarget.nextElementSibling as HTMLElement;
                    if (tooltip) tooltip.style.opacity = '0';
                  }}
                >
                  {copySuccess ? '✓' : '📋'}
                </button>
                <div
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#333',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    opacity: '0',
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    marginBottom: '8px'
                  }}
                >
                  {copySuccess ? 'Copied!' : 'Copy game ID to clipboard'}
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0',
                      height: '0',
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderTop: '4px solid #333'
                    }}
                  />
                </div>
              </div>
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