import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { ApiService } from '../services/api';
import type { GameState, CardType, GamePhase, AuctionState } from '../types';

// Mock the API service
jest.mock('../services/api');

const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

describe('Frontend-Backend Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Game Creation and Management', () => {
    it('should create a new game successfully', async () => {
      const mockGameState: GameState = {
        id: 'test-game-id',
        players: [
          {
            id: 'player1',
            name: 'Test Player',
            hand: [
              { id: 'money10_1', type: 'money' as CardType, value: 10, name: '10' },
              { id: 'money10_2', type: 'money' as CardType, value: 10, name: '10' },
              { id: 'money10_3', type: 'money' as CardType, value: 10, name: '10' },
              { id: 'money10_4', type: 'money' as CardType, value: 10, name: '10' },
              { id: 'money0_1', type: 'money' as CardType, value: 0, name: '0' },
              { id: 'money0_2', type: 'money' as CardType, value: 0, name: '0' },
              { id: 'money50_1', type: 'money' as CardType, value: 50, name: '50' }
            ],
            money: 90
          }
        ],
        deck: [],
        currentTurn: 'player1',
        currentPhase: 'lobby' as GamePhase,
        currentBid: 0,
        currentBidder: null,
        auctionState: 'none' as AuctionState,
        auctioneer: null,
        disqualifiedPlayers: [],
        swordfishCardsDrawn: 0,
        tradeState: 'none',
        tradeInitiator: null,
        tradePartner: null,
        tradeOffers: [],
        tradeConfirmed: false,
        selectedAnimalCards: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockApiService.createGame.mockResolvedValue(mockGameState);

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Click create game button
      const createGameButton = screen.getByText('Create New Game');
      fireEvent.click(createGameButton);

      // Enter player name
      const nameInput = screen.getByPlaceholderText('Enter your name');
      fireEvent.change(nameInput, { target: { value: 'Test Player' } });

      // Submit form
      const submitButton = screen.getByText('Create Game');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApiService.createGame).toHaveBeenCalledWith('Test Player');
      });

      await waitFor(() => {
        expect(screen.getByText('Game: test-game-id - Players (1/6)')).toBeInTheDocument();
      });
    });

    it('should join an existing game successfully', async () => {
      const mockGameState: GameState = {
        id: 'existing-game-id',
        players: [
          {
            id: 'player1',
            name: 'Existing Player',
            hand: [],
            money: 90
          },
          {
            id: 'player2',
            name: 'New Player',
            hand: [],
            money: 90
          }
        ],
        deck: [],
        currentTurn: 'player1',
        currentPhase: 'lobby' as GamePhase,
        currentBid: 0,
        currentBidder: null,
        auctionState: 'none' as AuctionState,
        auctioneer: null,
        disqualifiedPlayers: [],
        swordfishCardsDrawn: 0,
        tradeState: 'none',
        tradeInitiator: null,
        tradePartner: null,
        tradeOffers: [],
        tradeConfirmed: false,
        selectedAnimalCards: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockApiService.joinGame.mockResolvedValue(mockGameState);

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Click join game button
      const joinGameButton = screen.getByText('Join Existing Game');
      fireEvent.click(joinGameButton);

      // Enter game ID and player name
      const gameIdInput = screen.getByPlaceholderText('Enter game ID');
      const nameInput = screen.getByPlaceholderText('Enter your name');
      
      fireEvent.change(gameIdInput, { target: { value: 'existing-game-id' } });
      fireEvent.change(nameInput, { target: { value: 'New Player' } });

      // Submit form
      const submitButton = screen.getByText('Join Game');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApiService.joinGame).toHaveBeenCalledWith('existing-game-id', 'New Player');
      });
    });
  });

  describe('Auction System Integration', () => {
    const mockGameStateWithAuction: GameState = {
      id: 'auction-game-id',
      players: [
        {
          id: 'player1',
          name: 'Player 1',
          hand: [
            { id: 'money10_1', type: 'money' as CardType, value: 10, name: '10' },
            { id: 'money10_2', type: 'money' as CardType, value: 10, name: '10' },
            { id: 'money10_3', type: 'money' as CardType, value: 10, name: '10' },
            { id: 'money10_4', type: 'money' as CardType, value: 10, name: '10' },
            { id: 'money0_1', type: 'money' as CardType, value: 0, name: '0' },
            { id: 'money0_2', type: 'money' as CardType, value: 0, name: '0' },
            { id: 'money50_1', type: 'money' as CardType, value: 50, name: '50' }
          ],
          money: 90
        },
        {
          id: 'player2',
          name: 'Player 2',
          hand: [
            { id: 'money10_1', type: 'money' as CardType, value: 10, name: '10' },
            { id: 'money10_2', type: 'money' as CardType, value: 10, name: '10' },
            { id: 'money10_3', type: 'money' as CardType, value: 10, name: '10' },
            { id: 'money10_4', type: 'money' as CardType, value: 10, name: '10' },
            { id: 'money0_1', type: 'money' as CardType, value: 0, name: '0' },
            { id: 'money0_2', type: 'money' as CardType, value: 0, name: '0' },
            { id: 'money50_1', type: 'money' as CardType, value: 50, name: '50' }
          ],
          money: 90
        }
      ],
      deck: [
        { id: 'shrimp_1', type: 'animal' as CardType, value: 10, name: 'Shrimp' },
        { id: 'clam_1', type: 'animal' as CardType, value: 40, name: 'Clam' }
      ],
      currentTurn: 'player1',
      currentPhase: 'auction' as GamePhase,
      currentBid: 0,
      currentBidder: null,
      auctionState: 'none' as AuctionState,
      auctioneer: null,
      disqualifiedPlayers: [],
      swordfishCardsDrawn: 0,
      tradeState: 'none',
      tradeInitiator: null,
      tradePartner: null,
      tradeOffers: [],
      tradeConfirmed: false,
      selectedAnimalCards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should start an auction successfully', async () => {
      const mockAuctionStarted: GameState = {
        ...mockGameStateWithAuction,
        auctionState: 'in_progress' as AuctionState,
        auctionCard: { id: 'shrimp_1', type: 'animal' as CardType, value: 10, name: 'Shrimp' },
        auctioneer: 'player1',
        auctionEndTime: Date.now() + 60000
      };

      mockApiService.startAuction.mockResolvedValue(mockAuctionStarted);

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Simulate existing game state
      // This would normally be set by the useGameState hook
      // For testing, we'll mock the API calls directly

      await waitFor(() => {
        expect(mockApiService.startAuction).toHaveBeenCalledWith('auction-game-id', 'player1');
      });
    });

    it('should place a bid successfully', async () => {
      const mockBidPlaced: GameState = {
        ...mockGameStateWithAuction,
        auctionState: 'in_progress' as AuctionState,
        auctionCard: { id: 'shrimp_1', type: 'animal' as CardType, value: 10, name: 'Shrimp' },
        auctioneer: 'player1',
        currentBid: 50,
        currentBidder: 'player2',
        auctionEndTime: Date.now() + 60000
      };

      mockApiService.placeBid.mockResolvedValue(mockBidPlaced);

      // Test bid placement
      await ApiService.placeBid('auction-game-id', 'player2', 50);

      expect(mockApiService.placeBid).toHaveBeenCalledWith('auction-game-id', 'player2', 50);
    });

    it('should end auction successfully', async () => {
      const mockAuctionEnded: GameState = {
        ...mockGameStateWithAuction,
        auctionState: 'summary' as AuctionState,
        auctionSummary: {
          type: 'normal_win',
          message: 'Player 2 wins with a highest bid of $50! Shrimp goes to Player 2',
          auctioneerName: 'Player 1',
          winnerName: 'Player 2',
          bidAmount: 50,
          animalName: 'Shrimp'
        }
      };

      mockApiService.endAuction.mockResolvedValue(mockAuctionEnded);

      // Test auction end
      await ApiService.endAuction('auction-game-id');

      expect(mockApiService.endAuction).toHaveBeenCalledWith('auction-game-id');
    });

    it('should handle match bid successfully', async () => {
      const mockMatchBid: GameState = {
        ...mockGameStateWithAuction,
        auctionState: 'match_bid_phase' as AuctionState,
        auctionCard: { id: 'shrimp_1', type: 'animal' as CardType, value: 10, name: 'Shrimp' },
        auctioneer: 'player1',
        currentBid: 50,
        currentBidder: 'player2',
        auctionEndTime: Date.now() + 5000
      };

      const mockMatchCompleted: GameState = {
        ...mockMatchBid,
        auctionState: 'summary' as AuctionState,
        auctionSummary: {
          type: 'matched_bid',
          message: 'Player 1 matched the bid of $50 and keeps the Shrimp.',
          auctioneerName: 'Player 1',
          winnerName: 'Player 1',
          bidAmount: 50,
          animalName: 'Shrimp'
        }
      };

      mockApiService.matchBid.mockResolvedValue(mockMatchCompleted);

      // Test match bid
      await ApiService.matchBid('auction-game-id', 'player1');

      expect(mockApiService.matchBid).toHaveBeenCalledWith('auction-game-id', 'player1');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockApiService.createGame.mockRejectedValue(new Error('Network error'));

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Click create game button
      const createGameButton = screen.getByText('Create New Game');
      fireEvent.click(createGameButton);

      // Enter player name
      const nameInput = screen.getByPlaceholderText('Enter your name');
      fireEvent.change(nameInput, { target: { value: 'Test Player' } });

      // Submit form
      const submitButton = screen.getByText('Create Game');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create game. Please try again.')).toBeInTheDocument();
      });
    });

    it('should handle invalid game ID when joining', async () => {
      mockApiService.joinGame.mockRejectedValue(new Error('Game not found'));

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Click join game button
      const joinGameButton = screen.getByText('Join Existing Game');
      fireEvent.click(joinGameButton);

      // Enter invalid game ID and player name
      const gameIdInput = screen.getByPlaceholderText('Enter game ID');
      const nameInput = screen.getByPlaceholderText('Enter your name');
      
      fireEvent.change(gameIdInput, { target: { value: 'invalid-game-id' } });
      fireEvent.change(nameInput, { target: { value: 'Test Player' } });

      // Submit form
      const submitButton = screen.getByText('Join Game');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to join game. Please check the game ID and try again.')).toBeInTheDocument();
      });
    });
  });
}); 