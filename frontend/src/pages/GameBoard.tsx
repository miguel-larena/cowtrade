import React from 'react';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import TradingPanel from '../components/TradingPanel';
import Scoreboard from '../components/Scoreboard';
import type { GameState } from '../types';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string | null;
  onStartAuction: (auctioneerId: string) => Promise<void>;
  onPlaceBid: (bidderId: string, amount: number) => Promise<void>;
  onEndAuction: () => Promise<void>;
  onMatchBid: () => Promise<void>;
  onClearAuctionSummary: () => Promise<void>;
  onRestartAuctionAfterBluff: () => Promise<void>;
  onGiveCardToAuctioneer?: () => Promise<void>; // Optional: give card to auctioneer when all players disqualified
  onInitiateTrade: (initiatorId: string, partnerId: string) => Promise<void>;
  onMakeTradeOffer: (playerId: string, moneyCards: string[], animalCards: string[]) => Promise<void>;
  onExecuteTrade: () => Promise<void>;
}

// Action Button Component with hold-to-confirm functionality
interface ActionButtonProps {
  icon: string;
  title: string;
  description: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  onConfirm: () => void;
  disabled?: boolean;
  requireHold?: boolean; // Whether to require hold-to-confirm
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  description,
  backgroundColor,
  borderColor,
  textColor,
  onConfirm,
  disabled = false,
  requireHold = true
}) => {
  const [isHolding, setIsHolding] = React.useState(false);
  const [holdProgress, setHoldProgress] = React.useState(0);
  const holdTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const HOLD_DURATION = 1500; // 1.5 seconds to confirm

  const startHold = () => {
    if (disabled) return;
    
    if (!requireHold) {
      onConfirm();
      return;
    }
    
    setIsHolding(true);
    setHoldProgress(0);
    
    // Start progress bar
    holdIntervalRef.current = setInterval(() => {
      setHoldProgress(prev => {
        const newProgress = prev + (100 / (HOLD_DURATION / 16)); // 60fps update
        if (newProgress >= 100) {
          // Hold complete - confirm action
          clearInterval(holdIntervalRef.current!);
          setIsHolding(false);
          setHoldProgress(0);
          onConfirm();
          return 0;
        }
        return newProgress;
      });
    }, 16);
    
    // Set timeout to complete the hold
    holdTimeoutRef.current = setTimeout(() => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
      setIsHolding(false);
      setHoldProgress(0);
      onConfirm();
    }, HOLD_DURATION);
  };

  const stopHold = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  React.useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
      }
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: backgroundColor,
        borderRadius: '8px',
        border: `2px solid ${borderColor}`,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative' as const,
        overflow: 'hidden',
        opacity: disabled ? 0.6 : 1
      }}
      onMouseDown={startHold}
      onMouseUp={stopHold}
      onMouseLeave={stopHold}
      onTouchStart={startHold}
      onTouchEnd={stopHold}
      onTouchCancel={stopHold}
    >
      {/* Progress bar overlay */}
      {isHolding && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${holdProgress}%`,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            transition: 'width 0.016s linear',
            zIndex: 1
          }}
        />
      )}
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
        <h4 style={{ margin: '0 0 8px 0', color: textColor }}>{title}</h4>
        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
          {description}
        </p>
      </div>
    </div>
  );
};

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onStartAuction,
  onPlaceBid,
  onEndAuction,
  onMatchBid,
  onClearAuctionSummary,
  onRestartAuctionAfterBluff,
  onGiveCardToAuctioneer,
  onInitiateTrade,
  onMakeTradeOffer,
  onExecuteTrade
}) => {
  const [showTradeInterface, setShowTradeInterface] = React.useState(false);
  const [tradePartnerConfirmed, setTradePartnerConfirmed] = React.useState(false);

  // Only reset trade interface when trade is completely finished
  React.useEffect(() => {
    // Only reset if we're not in any trade state AND we were showing the trade interface
    // AND there's no trade initiator (meaning trade is completely done)
    if (gameState.tradeState === 'none' && showTradeInterface && gameState.tradeInitiator === null) {
      console.log('Resetting trade interface - trade completely finished');
      setShowTradeInterface(false);
      setTradePartnerConfirmed(false);
    }
  }, [gameState.tradeState, gameState.tradeInitiator]);

  // Automatically show trade interface when trade is in progress
  React.useEffect(() => {
    if (gameState.tradeState !== 'none' && !showTradeInterface) {
      console.log('Auto-showing trade interface - trade in progress:', gameState.tradeState);
      setShowTradeInterface(true);
    }
  }, [gameState.tradeState, showTradeInterface]);

  // Debug logging
  React.useEffect(() => {
    console.log('Trade state changed:', {
      tradeState: gameState.tradeState,
      tradeInitiator: gameState.tradeInitiator,
      showTradeInterface,
      currentPhase: gameState.currentPhase
    });
  }, [gameState.tradeState, gameState.tradeInitiator, showTradeInterface, gameState.currentPhase]);

    // Check if there are valid trading partners
  const hasValidTradingPartners = React.useMemo(() => {
    if (!currentPlayerId || !gameState.players) return false;
    
    const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return false;
    
    // Check if current player has animal cards to trade
    const hasAnimalCards = currentPlayer.hand.some(card => card.type === 'animal');
    if (!hasAnimalCards) return false;
    
    // Check if there are other players with animal cards
    const otherPlayersWithAnimals = gameState.players.filter(p => 
      p.id !== currentPlayerId && 
      p.hand.some(card => card.type === 'animal')
    );
    
    return otherPlayersWithAnimals.length > 0;
  }, [currentPlayerId, gameState.players]);

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
            Waiting for the game to start...
          </div>
        );
      
      case 'auction':
        // If player wants to trade, show TradingPanel
        if (showTradeInterface) {
          return (
            <div>
              <div style={{
                padding: '16px',
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '2px solid #ffc107',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: '0', color: '#856404' }}>
                  🤝 Trade Mode - Select a trading partner
                </h3>
                <button
                  onClick={() => setShowTradeInterface(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ffc107',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ← Back to Actions
                </button>
              </div>
              <TradingPanel
                gameState={gameState}
                currentPlayerId={currentPlayerId || ''}
                onInitiateTrade={onInitiateTrade}
                onMakeTradeOffer={onMakeTradeOffer}
                onExecuteTrade={onExecuteTrade}
                onTradePartnerConfirmed={() => setTradePartnerConfirmed(true)}
              />
            </div>
          );
        }

        return (
          <div>
            {/* Show choice between Auction and Trade when it's the player's turn AND no trade partner has been confirmed */}
            {currentPlayerId && gameState.currentTurn === currentPlayerId && !tradePartnerConfirmed ? (
              <div style={{
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '2px solid #e9ecef',
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  color: '#2c3e50',
                  fontSize: '20px',
                  textAlign: 'center'
                }}>
                  🎯 Your Turn - Choose Your Action
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  {/* Auction Option */}
                  <ActionButton
                    icon="🏷️"
                    title="Auction"
                    description="Draw and auction an Animal"
                    backgroundColor="#e3f2fd"
                    borderColor="#2196F3"
                    textColor="#1976D2"
                    onConfirm={() => onStartAuction(currentPlayerId)}
                    requireHold={true}
                  />

                  {/* Trade Option */}
                  <div style={{
                    padding: '20px',
                    backgroundColor: hasValidTradingPartners ? '#ffebee' : '#f5f5f5',
                    borderRadius: '8px',
                    border: `2px solid ${hasValidTradingPartners ? '#f44336' : '#ccc'}`,
                    textAlign: 'center',
                    cursor: hasValidTradingPartners ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    opacity: hasValidTradingPartners ? 1 : 0.6
                  }}
                  onClick={() => {
                    if (hasValidTradingPartners) {
                      // Switch to trade interface - this is a commitment
                      setShowTradeInterface(true);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (hasValidTradingPartners) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
                    <h4 style={{ margin: '0 0 8px 0', color: hasValidTradingPartners ? '#d32f2f' : '#999' }}>Trade</h4>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      {hasValidTradingPartners 
                        ? 'Challenge a player to a trade battle' 
                        : 'No players available to trade with'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Show Auction Panel if auction is in progress */}
            {gameState.auctionState !== 'none' ? (
              <AuctionPanel
                gameState={gameState}
                currentPlayerId={currentPlayerId || ''}
                onStartAuction={onStartAuction}
                onPlaceBid={onPlaceBid}
                onEndAuction={onEndAuction}
                onMatchBid={onMatchBid}
                onClearAuctionSummary={onClearAuctionSummary}
                onRestartAuctionAfterBluff={onRestartAuctionAfterBluff}
                onGiveCardToAuctioneer={onGiveCardToAuctioneer}
              />
            ) : (
              /* Show current auction card if available but no auction in progress AND no trade in progress */
              gameState.auctionCard && gameState.tradeState === 'none' && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#e3f2fd',
                  borderRadius: '8px',
                  border: '2px solid #2196F3',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1976D2' }}>
                    Current Auction Card
                  </h4>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '120px',
                      backgroundColor: '#fff',
                      border: '2px solid #2196F3',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#2196F3'
                    }}>
                      {gameState.auctionCard.name}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Type:</strong> {gameState.auctionCard.type}
                      </p>
                      <p style={{ margin: '4px 0', fontSize: '14px' }}>
                        <strong>Value:</strong> ${gameState.auctionCard.value}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        );
      
      case 'trade':
        return (
          <TradingPanel
            gameState={gameState}
            currentPlayerId={currentPlayerId || ''}
            onInitiateTrade={onInitiateTrade}
            onMakeTradeOffer={onMakeTradeOffer}
            onExecuteTrade={onExecuteTrade}
          />
        );
      
      case 'end':
        return (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#28a745',
            fontSize: '24px',
            fontWeight: 'bold',
            backgroundColor: '#d4edda',
            borderRadius: '12px',
            border: '2px solid #c3e6cb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            🏆 Game Over! Check the scoreboard for final results.
          </div>
        );
      
      default:
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
            Unknown game phase
          </div>
        );
    }
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
              fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      color: '#2c3e50',
      backgroundColor: '#f8f9fa',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Current Player's Hand - Top */}
        {currentPlayerId && (
          <div style={{
            width: '100%',
            maxWidth: '100%'
          }}>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              color: '#2c3e50',
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: '600'
            }}>
              Your Hand
            </h2>
            <div style={{ 
              display: 'grid', 
              gap: '16px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
                          {gameState.players
              .filter(player => player.id === currentPlayerId)
              .map((player) => (
                <PlayerHand
                  key={player.id}
                  player={player}
                  isCurrentPlayer={true}
                  isCurrentTurn={gameState.currentTurn === player.id}
                  showBluffInfo={gameState.auctionState === 'summary' && gameState.auctionSummary?.type === 'bluff_detected'}
                  bluffInfo={gameState.auctionSummary?.type === 'bluff_detected' && 
                    gameState.auctionSummary.blufferName && 
                    gameState.auctionSummary.blufferMoney !== undefined && 
                    gameState.auctionSummary.bidAmount !== undefined && 
                    gameState.auctionSummary.animalName ? {
                    blufferName: gameState.auctionSummary.blufferName,
                    blufferMoney: gameState.auctionSummary.blufferMoney,
                    bidAmount: gameState.auctionSummary.bidAmount,
                    animalName: gameState.auctionSummary.animalName
                  } : undefined}
                  currentAuctioneer={gameState.auctioneer}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Game Area - Auction/Trade Panels */}
        <div style={{
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Phase Content */}
          <div style={{
            width: '100%',
            marginBottom: '24px'
          }}>
            {renderPhaseContent()}
          </div>
        </div>

        {/* Other Players' Hands - Bottom */}
        <div style={{
          width: '100%',
          maxWidth: '100%'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            color: '#2c3e50',
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600'
          }}>
            Other Players
          </h2>
          <div style={{ 
            display: 'grid', 
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {gameState.players
              .filter(player => player.id !== currentPlayerId)
              .map((player) => (
                <PlayerHand
                  key={player.id}
                  player={player}
                  isCurrentPlayer={false}
                  isCurrentTurn={gameState.currentTurn === player.id}
                  showBluffInfo={gameState.auctionState === 'summary' && gameState.auctionSummary?.type === 'bluff_detected'}
                  bluffInfo={gameState.auctionSummary?.type === 'bluff_detected' && 
                    gameState.auctionSummary.blufferName && 
                    gameState.auctionSummary.blufferMoney !== undefined && 
                    gameState.auctionSummary.bidAmount !== undefined && 
                    gameState.auctionSummary.animalName ? {
                    blufferName: gameState.auctionSummary.blufferName,
                    blufferMoney: gameState.auctionSummary.blufferMoney,
                    bidAmount: gameState.auctionSummary.bidAmount,
                    animalName: gameState.auctionSummary.animalName
                  } : undefined}
                  currentAuctioneer={gameState.auctioneer}
                />
              ))}
          </div>
        </div>

        {/* Sidebar - Only show when game ends */}
        {gameState.currentPhase === 'end' && (
          <div style={{
            width: '100%',
            maxWidth: '100%',
            order: -1
          }}>
            <Scoreboard
              players={gameState.players}
              currentTurn={gameState.currentTurn}
              currentPhase={gameState.currentPhase}
              auctionState={gameState.auctionState}
              auctionCard={gameState.auctionCard}
              currentBid={gameState.currentBid}
              currentBidder={gameState.currentBidder}
              auctioneer={gameState.auctioneer}
              auctionSummary={gameState.auctionSummary}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;