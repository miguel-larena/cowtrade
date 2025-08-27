import React, { useState, useEffect, useRef } from 'react';
import type { GameState } from '../types';
import CardComponent from './Card';

interface AuctionPanelProps {
  gameState: GameState;
  currentPlayerId: string;
  onStartAuction: (auctioneerId: string) => void;
  onPlaceBid: (bidderId: string, amount: number) => void;
  onEndAuction: () => void;
  onMatchBid: () => void;
  onClearAuctionSummary: () => void;
  onRestartAuctionAfterBluff: () => Promise<void>;
  onGiveCardToAuctioneer?: () => Promise<void>; // Optional: give card to auctioneer when all players disqualified
}

const AuctionPanel: React.FC<AuctionPanelProps> = ({
  gameState,
  currentPlayerId,
  onStartAuction,
  onPlaceBid,
  onEndAuction,
  onMatchBid,
  onClearAuctionSummary,
  onRestartAuctionAfterBluff,
  onGiveCardToAuctioneer
}) => {
  // Function to transform auction summary messages to use "You" when appropriate
  const transformAuctionMessage = (message: string) => {
    if (!currentPlayerId || !gameState.auctioneer) return message;
    
    // Check if the current player is the auctioneer
    const isCurrentPlayerAuctioneer = currentPlayerId === gameState.auctioneer;
    
    // Transform messages to use "You" when it's the current player's view
    if (isCurrentPlayerAuctioneer) {
      // Replace "No one bid on [Animal]. [PlayerName] keeps the card." with "You keep the card"
      message = message.replace(
        /No one bid on ([^.]+)\. ([^.]+) keeps the card\./,
        'No one bid on $1. You keep the card.'
      );
      
      // Replace "[PlayerName] won the auction for [Animal] with a bid of $[Amount]." with "You won the auction..."
      message = message.replace(
        /([^.]+) won the auction for ([^.]+) with a bid of \$([^.]+)\./,
        'You won the auction for $2 with a bid of $$3.'
      );
      
      // Replace "[PlayerName] successfully auctioned [Animal] for $[Amount]." with "You successfully auctioned..."
      message = message.replace(
        /([^.]+) successfully auctioned ([^.]+) for \$([^.]+)\./,
        'You successfully auctioned $2 for $$3.'
      );
      
      // Replace "All other players were disqualified. [PlayerName] receives the [Animal] card." with "You receive the [Animal] card"
      message = message.replace(
        /All other players were disqualified\. ([^.]+) receives the ([^.]+) card\./,
        'All other players were disqualified. You receive the $2 card.'
      );
    }
    
    return message;
  };
  const [bidAmount, setBidAmount] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [bluffRestartTimer, setBluffRestartTimer] = useState<number>(5);
  const timerExpiredRef = useRef<boolean>(false);
  const isTimerRunningRef = useRef<boolean>(false);
  const hasGivenCardToAuctioneerRef = useRef<boolean>(false);
  const hasRestartedAuctionRef = useRef<boolean>(false);
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const auctioneer = gameState.players.find(p => p.id === gameState.auctioneer);

  // Timer effect - only the auctioneer should end the auction on timeout
  useEffect(() => {
    if ((gameState.auctionState === 'in_progress' || gameState.auctionState === 'match_bid_phase') && gameState.auctionEndTime) {
      // Reset timer expired flag when auction state changes
      timerExpiredRef.current = false;
      
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((gameState.auctionEndTime! - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        // Only the auctioneer should trigger the timeout
        if (remaining <= 0 && !timerExpiredRef.current && gameState.auctioneer === currentPlayerId) {
          timerExpiredRef.current = true;
          onEndAuction();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.auctionState, gameState.auctionEndTime, onEndAuction, currentPlayerId, gameState.auctioneer]);

  // Bluff restart timer effect - restart auction or give card to auctioneer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    console.log('Bluff restart timer effect triggered:', {
      auctionState: gameState.auctionState,
      auctionSummaryType: gameState.auctionSummary?.type,
      bluffRestartTimer,
      currentPlayerId,
      auctioneer: gameState.auctioneer,
      isTimerRunning: isTimerRunningRef.current
    });
    
    // Only proceed if we're in bluff detected state
    if (gameState.auctionState === 'summary' && gameState.auctionSummary?.type === 'bluff_detected') {
      // Check if all other players are disqualified first (for all players, not just auctioneer)
      const activePlayers = gameState.players.filter(player => 
        player.id !== gameState.auctioneer && 
        !gameState.disqualifiedPlayers.includes(player.id)
      );
      
      console.log('Active players check:', {
        totalPlayers: gameState.players.length,
        auctioneer: gameState.auctioneer,
        disqualifiedPlayers: gameState.disqualifiedPlayers,
        activePlayers: activePlayers.map(p => p.name),
        currentPlayerId,
        isAuctioneer: gameState.auctioneer === currentPlayerId
      });
      
      if (activePlayers.length === 0) {
        // All other players are disqualified - give card to auctioneer immediately
        console.log('All players disqualified - giving card to auctioneer immediately (no timer needed)');
        if (gameState.auctioneer === currentPlayerId && !hasGivenCardToAuctioneerRef.current) {
          console.log('Calling onGiveCardToAuctioneer (first time)');
          hasGivenCardToAuctioneerRef.current = true;
          onGiveCardToAuctioneer?.().catch(error => {
            console.error('Failed to give card to auctioneer:', error);
          });
        }
        return; // Exit early, no timer needed
      }
      
      // Only start timer if there are active players and timer isn't already running
      if (!isTimerRunningRef.current) {
        console.log('Starting bluff restart timer');
        isTimerRunningRef.current = true;
        setBluffRestartTimer(5);
        interval = setInterval(() => {
          setBluffRestartTimer(prev => {
            console.log('Bluff restart timer tick:', prev);
            if (prev <= 1) {
              // Timer finished - restart the auction (we already know there are active players)
              if (gameState.auctioneer === currentPlayerId && !hasRestartedAuctionRef.current) {
                console.log('Active players remain - restarting auction (first time)');
                hasRestartedAuctionRef.current = true;
                onRestartAuctionAfterBluff().catch(error => {
                  console.error('Failed to restart auction after bluff:', error);
                });
              }
              // Clear the timer and stop the countdown
              isTimerRunningRef.current = false;
              if (interval) {
                clearInterval(interval);
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else if (gameState.auctionState === 'summary' && gameState.auctionSummary?.type === 'no_bids') {
      // Handle no bids scenario - this means the auction ended with no bids
      // This could happen after a restart if all players are disqualified
      console.log('Auction ended with no bids - checking if auctioneer should get card');
      if (gameState.auctioneer === currentPlayerId) {
        // Check if all other players are disqualified
        const activePlayers = gameState.players.filter(player => 
          player.id !== gameState.auctioneer && 
          !gameState.disqualifiedPlayers.includes(player.id)
        );
        
        if (activePlayers.length === 0) {
          console.log('All players disqualified and no bids - auctioneer should already have the card');
          // The backend should have already given the card to the auctioneer
          // We just need to clear the summary to move on
          try {
            onClearAuctionSummary?.();
          } catch (error) {
            console.error('Failed to clear auction summary:', error);
          }
        }
      }
      // Reset timer when not in bluff detected state
      if (bluffRestartTimer > 0) {
        console.log('Resetting bluff restart timer - auction ended with no bids');
        setBluffRestartTimer(0);
        isTimerRunningRef.current = false;
      }
      // Reset the give card ref when not in bluff detected state
      if (hasGivenCardToAuctioneerRef.current) {
        console.log('Resetting hasGivenCardToAuctioneer ref - not in bluff detected state');
        hasGivenCardToAuctioneerRef.current = false;
      }
      // Reset the restart auction ref when not in bluff detected state
      if (hasRestartedAuctionRef.current) {
        console.log('Resetting hasRestartedAuction ref - not in bluff detected state');
        hasRestartedAuctionRef.current = false;
      }
    } else {
      // Reset timer when not in bluff detected state
      if (bluffRestartTimer > 0) {
        console.log('Resetting bluff restart timer - not in bluff detected state');
        setBluffRestartTimer(0);
        isTimerRunningRef.current = false;
      }
      // Reset the give card ref when not in bluff detected state
      if (hasGivenCardToAuctioneerRef.current) {
        console.log('Resetting hasGivenCardToAuctioneer ref - not in bluff detected state');
        hasGivenCardToAuctioneerRef.current = false;
      }
      // Reset the restart auction ref when not in bluff detected state
      if (hasRestartedAuctionRef.current) {
        console.log('Resetting hasRestartedAuction ref - not in bluff detected state');
        hasRestartedAuctionRef.current = false;
      }
    }

    return () => {
      if (interval) {
        console.log('Cleaning up bluff restart timer interval');
        clearInterval(interval);
        isTimerRunningRef.current = false;
      }
    };
  }, [gameState.auctionState, gameState.auctionSummary?.type, onRestartAuctionAfterBluff, onGiveCardToAuctioneer, onClearAuctionSummary, currentPlayerId, gameState.auctioneer]);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBidAmount(value);
  };

  const handlePlaceBid = () => {
    const isValidBid = bidAmount >= 10 && bidAmount % 10 === 0 && bidAmount > gameState.currentBid;
    const canAfford = currentPlayer && bidAmount <= currentPlayer.money;
    const isBluffing = isValidBid && !canAfford;
    
    if (isValidBid || isBluffing) {
      onPlaceBid(currentPlayerId, bidAmount);
      setBidAmount(gameState.currentBid + 10); // Set next valid bid amount
    }
  };

  const isCurrentPlayerTurn = gameState.currentTurn === currentPlayerId;
  const isAuctioneer = gameState.auctioneer === currentPlayerId;
  const isValidBid = currentPlayer && 
                     gameState.auctionState === 'in_progress' && 
                     !isAuctioneer && 
                     bidAmount > gameState.currentBid && 
                     bidAmount % 10 === 0;
  const canAfford = currentPlayer && bidAmount <= currentPlayer.money;
  const canBid = isValidBid && canAfford;
  const isBluffing = isValidBid && !canAfford;

  const canStartAuction = isCurrentPlayerTurn && gameState.auctionState === 'none';
  
  // Check if deck has animal cards
  const animalCardsInDeck = gameState.deck.filter(card => card.type === 'animal');
  const canDrawCard = animalCardsInDeck.length > 0;
  const canStartAuctionWithCard = canStartAuction && canDrawCard;
  
  // Debug logging
  console.log('AuctionPanel Debug:', {
    currentPlayerId,
    currentTurn: gameState.currentTurn,
    isCurrentPlayerTurn,
    auctionState: gameState.auctionState,
    auctionEndTime: gameState.auctionEndTime,
    timeLeft,
    timerExpired: timerExpiredRef.current,
    canStartAuction,
    canDrawCard,
    animalCardsInDeck: animalCardsInDeck.length,
    currentPlayerName: gameState.players.find(p => p.id === currentPlayerId)?.name,
    currentTurnPlayerName: gameState.players.find(p => p.id === gameState.currentTurn)?.name
  });

  return (
    <div style={{
      border: '2px solid #2196F3',
      borderRadius: '8px',
      padding: '20px',
      margin: '16px',
              backgroundColor: '#e3f2fd'
    }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#1976D2' }}>
        Auction
      </h2>
      
      {/* Turn Indicator */}
      <div style={{ 
        marginBottom: '16px',
        padding: '8px 12px',
        backgroundColor: isCurrentPlayerTurn ? '#2196F3' : '#f5f5f5',
        borderRadius: '4px',
        border: isCurrentPlayerTurn ? '2px solid #1976D2' : '1px solid #ddd'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 'bold',
          color: isCurrentPlayerTurn ? 'white' : '#666'
        }}>
          Current Turn: {gameState.players.find(p => p.id === gameState.currentTurn)?.name || 'Unknown'}
          {isCurrentPlayerTurn && (
            <span style={{ marginLeft: '8px', fontSize: '12px' }}>
              (Your Turn)
            </span>
          )}
        </div>
      </div>
      
      {/* Deck Status */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          Animal Cards in Deck: {animalCardsInDeck.length}/40
          {animalCardsInDeck.length === 0 && (
            <span style={{ 
              marginLeft: '8px', 
              color: '#FF5722', 
              fontWeight: 'bold',
              fontStyle: 'italic'
            }}>
              (Deck Empty - No More Auctions)
            </span>
          )}
        </div>
        
        {(gameState.auctionState === 'in_progress' || gameState.auctionState === 'match_bid_phase') && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Time Left: {timeLeft} seconds
          </div>
        )}
      </div>

      {/* Empty Deck Message */}
      {canStartAuction && !canDrawCard && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#856404', marginBottom: '8px' }}>
            🃏 Deck Empty
          </div>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            All animals have been auctioned!
          </div>
        </div>
      )}

      {/* Start Auction Button */}
      {canStartAuctionWithCard && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => onStartAuction(currentPlayerId)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Draw Card
          </button>
        </div>
      )}

      {/* Swordfish Bonus Notification */}
      {gameState.swordfishCardsDrawn > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#e3f2fd',
          border: '2px solid #2196F3',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976D2', marginBottom: '8px' }}>
            🐟 Swordfish Bonus!
          </div>
          <div style={{ fontSize: '14px', color: '#1976D2' }}>
            All players received ${gameState.swordfishCardsDrawn === 1 ? '50' : 
                                gameState.swordfishCardsDrawn === 2 ? '100' : 
                                gameState.swordfishCardsDrawn === 3 ? '200' : '500'}!
          </div>
        </div>
      )}

      {/* Auction Card Display */}
      {gameState.auctionCard && (
        <div style={{ 
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '2px solid #2196F3'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Left side - Text content */}
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                color: '#1976D2',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                🎯 Current Auction
              </h3>
              <div style={{ 
                fontSize: '16px', 
                color: '#1976D2',
                marginBottom: '8px'
              }}>
                {auctioneer && `${auctioneer.id === currentPlayerId ? 'You are' : `${auctioneer.name} is`} auctioning a ${gameState.auctionCard.name}`}
              </div>
            </div>
            
            {/* Right side - Large card display */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{
                transform: 'scale(1.5)',
                transformOrigin: 'center'
              }}>
                <CardComponent 
                  card={gameState.auctionCard} 
                  onCardClick={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bidding Section */}
      {gameState.auctionState === 'in_progress' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            Highest Bid: ${gameState.currentBid}
          </div>
          {gameState.currentBidder && (
            <div style={{ fontSize: '14px', color: '#666' }}>
              Bidder: {gameState.currentBidder === currentPlayerId ? 'You' : gameState.players.find(p => p.id === gameState.currentBidder)?.name}
            </div>
          )}
          
          {/* Disqualified Players Display */}
          {gameState.disqualifiedPlayers.length > 0 && (
            <div style={{ 
              marginTop: '8px',
              padding: '12px',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '4px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d32f2f', marginBottom: '8px' }}>
                🚫 Bluffers:
              </div>
              {gameState.disqualifiedPlayers.map(playerId => {
                const player = gameState.players.find(p => p.id === playerId);
                if (!player) return null;
                
                const moneyCards = player.hand.filter(card => card.type === 'money');
                const totalMoney = moneyCards.reduce((sum, card) => sum + card.value, 0);
                
                return (
                  <div key={playerId} style={{
                    marginBottom: '12px',
                    padding: '8px',
                    backgroundColor: '#fff',
                    border: '1px solid #f44336',
                    borderRadius: '4px'
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      fontWeight: 'bold', 
                      color: '#d32f2f',
                      marginBottom: '6px'
                    }}>
                      {player.name} - Total Money: ${totalMoney}
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: '#666',
                      marginBottom: '6px'
                    }}>
                      Money Cards:
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '4px', 
                      flexWrap: 'wrap',
                      maxWidth: '100%'
                    }}>
                      {moneyCards.map(card => (
                        <div key={card.id} style={{
                          transform: 'scale(0.7)',
                          transformOrigin: 'left center'
                        }}>
                          <CardComponent 
                            card={card} 
                            onCardClick={() => {}}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!isAuctioneer && currentPlayer && (
            <div style={{ marginTop: '16px' }}>
              {/* Check if current player is disqualified */}
              {gameState.disqualifiedPlayers.includes(currentPlayerId) ? (
                <div style={{
                  padding: '12px',
                  backgroundColor: '#ffebee',
                  border: '2px solid #f44336',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#d32f2f', marginBottom: '4px' }}>
                    🚫 You are disqualified from this auction
                  </div>
                  <div style={{ fontSize: '12px', color: '#d32f2f' }}>
                    You cannot place bids until this auction ends
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                    Your Money: ${currentPlayer.money}
                  </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={handleBidChange}
                  min={gameState.currentBid + 10}
                  max={1000}
                  step={10}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    width: '100px'
                  }}
                  placeholder="Bid amount"
                />
                <button
                  onClick={handlePlaceBid}
                  disabled={!canBid && !isBluffing}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: canBid ? '#2196F3' : isBluffing ? '#FF5722' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (canBid || isBluffing) ? 'pointer' : 'not-allowed'
                  }}
                >
                  {canBid ? 'Place Bid' : isBluffing ? 'Bluff' : 'Place Bid'}
                </button>
              </div>
              {bidAmount > 0 && !canBid && !isBluffing && (
                <div style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>
                  {bidAmount <= gameState.currentBid 
                    ? 'Bid must be higher than current bid' 
                    : bidAmount % 10 !== 0
                    ? 'Bid must be a multiple of 10'
                    : 'Invalid bid'}
                </div>
              )}
              {isBluffing && (
                <div style={{ fontSize: '12px', color: '#FF5722', marginTop: '4px', fontWeight: 'bold' }}>
                  Bluffing! You only have ${currentPlayer?.money}
                </div>
              )}
                </>
              )}
            </div>
          )}
          
          {isAuctioneer && (
            <div style={{ 
              color: '#666', 
              fontStyle: 'italic',
              marginTop: '16px'
            }}>
              You are the auctioneer and cannot bid during your own auction
            </div>
          )}
        </div>
      )}

      {/* Match Bid Phase */}
      {gameState.auctionState === 'match_bid_phase' && gameState.auctioneer === currentPlayerId && (
        <div style={{ marginTop: '20px' }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FF5722',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Match the highest bid of ${gameState.currentBid} to keep the card? {timeLeft} seconds left.
          </div>
          {currentPlayer && currentPlayer.money >= gameState.currentBid ? (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={onMatchBid}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#FF5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '200px'
                }}
              >
                Match Bid (${gameState.currentBid})
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '12px 24px',
                backgroundColor: '#ccc',
                color: '#666',
                border: '1px solid #999',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'inline-block',
                maxWidth: '300px'
              }}>
                Cannot Match Bid - Not Enough Money (You have ${currentPlayer?.money || 0})
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auction Summary - Only show non-bluff summaries */}
      {gameState.auctionState === 'summary' && gameState.auctionSummary && gameState.auctionSummary.type !== 'bluff_detected' && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '2px solid #2196F3',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#1976D2'
          }}>
            🎯 Auction Complete
          </h3>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            {transformAuctionMessage(gameState.auctionSummary.message)}
          </div>
          
          {/* Show disqualified players list when auctioneer wins */}
          {gameState.auctionSummary.type === 'auctioneer_wins' && gameState.disqualifiedPlayers.length > 0 && (
            <div style={{ 
              marginTop: '20px',
              padding: '16px',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#d32f2f', marginBottom: '12px', textAlign: 'center' }}>
                🚫 Disqualified Players
              </div>
              {gameState.disqualifiedPlayers.map(playerId => {
                const player = gameState.players.find(p => p.id === playerId);
                if (!player) return null;
                
                const moneyCards = player.hand.filter(card => card.type === 'money');
                const totalMoney = moneyCards.reduce((sum, card) => sum + card.value, 0);
                
                return (
                  <div key={playerId} style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid #f44336',
                    borderRadius: '6px'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      color: '#d32f2f',
                      marginBottom: '8px'
                    }}>
                      {player.name} - Total Money: ${totalMoney}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      marginBottom: '8px'
                    }}>
                      Money Cards:
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '6px', 
                      flexWrap: 'wrap',
                      maxWidth: '100%'
                    }}>
                      {moneyCards.map(card => (
                        <div key={card.id} style={{
                          transform: 'scale(0.8)',
                          transformOrigin: 'left center'
                        }}>
                          <CardComponent 
                            card={card} 
                            onCardClick={() => {}}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <button
            onClick={onClearAuctionSummary}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Bluff Restart Timer - Only show when bluff detected */}
      {gameState.auctionState === 'summary' && gameState.auctionSummary?.type === 'bluff_detected' && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '2px solid #ffc107',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#856404'
          }}>
            🚫 Bluff Detected
          </h3>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#856404',
            marginBottom: '16px'
          }}>
            Restarting auction in {bluffRestartTimer} seconds...
          </div>
        </div>
      )}

      {/* Manual End Auction Button (for testing) */}
      {gameState.auctionState === 'in_progress' && (
        <button
          onClick={onEndAuction}
          style={{
            padding: '12px 24px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px',
            width: '100%'
          }}
        >
          End Auction (Manual)
        </button>
      )}

    </div>
  );
};

export default AuctionPanel; 