const API_BASE = 'http://localhost:3001/api/game';

async function testManualHandScenario() {
  try {
    console.log('🧪 Testing Manual Hand Scenario...\n');
    console.log('This will manually set up Player A to have only 1x $10 + 1x $50\n');

    // Step 1: Create a game
    console.log('1. Creating game...');
    const createResponse = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: 'Player1' })
    });
    const game = await createResponse.json();
    const gameId = game.id;
    const player1Id = game.players[0].id;
    console.log(`✅ Game created: ${gameId}`);
    console.log(`✅ Player 1 ID: ${player1Id}\n`);

    // Step 2: Join with second player
    console.log('2. Joining with second player...');
    const joinResponse = await fetch(`${API_BASE}/${gameId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: 'Player2' })
    });
    const gameWithTwoPlayers = await joinResponse.json();
    const player2Id = gameWithTwoPlayers.players[1].id;
    console.log(`✅ Player 2 joined: ${player2Id}\n`);

    // Step 3: Start the game
    console.log('3. Starting game...');
    const startResponse = await fetch(`${API_BASE}/${gameId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const startedGame = await startResponse.json();
    console.log(`✅ Game started. Current phase: ${startedGame.currentPhase}\n`);

    // Step 4: Manually modify Player 1's hand to have only 1x $10 + 1x $50
    console.log('4. Manually setting up Player 1 hand...');
    
    // Get the current game state
    const getGameResponse = await fetch(`${API_BASE}/${gameId}`);
    const currentGame = await getGameResponse.json();
    
    // Find Player 1
    const player1 = currentGame.players.find(p => p.id === player1Id);
    if (player1) {
      console.log(`Player 1 original hand: ${player1.hand.filter(c => c.type === 'money').map(c => `$${c.value}`).join(', ')}`);
      
      // Remove all money cards except 1x $10 and 1x $50
      const moneyCards = player1.hand.filter(c => c.type === 'money');
      const tenCard = moneyCards.find(c => c.value === 10);
      const fiftyCard = moneyCards.find(c => c.value === 50);
      
      // Clear all money cards
      player1.hand = player1.hand.filter(c => c.type !== 'money');
      
      // Add back only 1x $10 and 1x $50
      if (tenCard) player1.hand.push(tenCard);
      if (fiftyCard) player1.hand.push(fiftyCard);
      
      // Update money total
      player1.money = 60; // $10 + $50
      
      console.log(`Player 1 modified hand: ${player1.hand.filter(c => c.type === 'money').map(c => `$${c.value}`).join(', ')}`);
      console.log(`Player 1 money total: $${player1.money}\n`);
    }

    // Step 5: Start an auction
    console.log('5. Starting auction...');
    const auctionResponse = await fetch(`${API_BASE}/${gameId}/auction/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: player1Id })
    });
    const auctionGame = await auctionResponse.json();
    
    console.log(`✅ Auction started`);
    console.log(`✅ Auction card: ${auctionGame.auctionCard?.name}\n`);

    // Step 6: Player 2 bids $20
    console.log('6. Player 2 bidding $20...');
    const bidResponse = await fetch(`${API_BASE}/${gameId}/auction/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: player2Id, amount: 20 })
    });
    const bidGame = await bidResponse.json();
    console.log(`✅ Bid placed: $${bidGame.currentBid}`);
    console.log(`✅ Current bidder: ${bidGame.currentBidder}\n`);

    // Step 7: End auction (this puts it in match bid phase)
    console.log('7. Ending auction (entering match bid phase)...');
    const endResponse = await fetch(`${API_BASE}/${gameId}/auction/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const endGame = await endResponse.json();
    
    console.log(`✅ Auction ended`);
    console.log(`✅ Auction state: ${endGame.auctionState}\n`);

    // Step 8: Player 1 (auctioneer) matches the bid
    console.log('8. Player 1 (auctioneer) matching the bid...');
    console.log('   This should trigger the transfer logic...\n');
    
    const matchResponse = await fetch(`${API_BASE}/${gameId}/auction/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: player1Id })
    });
    const finalGame = await matchResponse.json();
    
    console.log(`✅ Bid matched`);
    console.log(`✅ Final auction state: ${finalGame.auctionState}`);
    console.log(`✅ Winner: ${finalGame.auctionSummary?.winnerName}`);
    console.log(`✅ Bid amount: $${finalGame.auctionSummary?.bidAmount}`);
    console.log(`✅ Summary: ${finalGame.auctionSummary?.message}\n`);

    // Step 9: Check payment results
    console.log('9. Checking payment results...');
    
    // Find the winner and auctioneer
    const winner = finalGame.players.find(p => p.id === finalGame.currentBidder);
    const auctioneer = finalGame.players.find(p => p.id === finalGame.auctioneer);
    
    if (winner && auctioneer) {
      console.log(`Winner (${winner.name}):`);
      console.log(`  Money: $${winner.money}`);
      const winnerMoneyCards = winner.hand.filter(c => c.type === 'money');
      console.log(`  Money cards: ${winnerMoneyCards.length}`);
      console.log(`  Money card values: ${winnerMoneyCards.map(c => `$${c.value}`).join(', ')}`);
      
      console.log(`\nAuctioneer (${auctioneer.name}):`);
      console.log(`  Money: $${auctioneer.money}`);
      const auctioneerMoneyCards = auctioneer.hand.filter(c => c.type === 'money');
      console.log(`  Money cards: ${auctioneerMoneyCards.length}`);
      console.log(`  Money card values: ${auctioneerMoneyCards.map(c => `$${c.value}`).join(', ')}`);
      
      // Analyze the payment
      const expectedBidAmount = finalGame.auctionSummary?.bidAmount || 20;
      const winnerTotal = winnerMoneyCards.reduce((sum, card) => sum + card.value, 0);
      const auctioneerTotal = auctioneerMoneyCards.reduce((sum, card) => sum + card.value, 0);
      
      console.log(`\n📊 Payment Analysis:`);
      console.log(`Expected bid amount: $${expectedBidAmount}`);
      console.log(`Winner total card value: $${winnerTotal}`);
      console.log(`Auctioneer total card value: $${auctioneerTotal}`);
      
      // Check if the payment was correct
      if (winner.name === 'Player2') {
        // Player 2 won, so Player 1 (auctioneer) should have paid
        const player1InitialTotal = 60; // Modified starting money
        const player1FinalTotal = auctioneerTotal;
        const actualPayment = player1InitialTotal - player1FinalTotal;
        
        console.log(`\n🎯 Payment Analysis:`);
        console.log(`Player 1 initial total: $${player1InitialTotal}`);
        console.log(`Player 1 final total: $${player1FinalTotal}`);
        console.log(`Actual payment: $${actualPayment}`);
        console.log(`Expected payment: $${expectedBidAmount}`);
        console.log(`Overpayment: $${actualPayment - expectedBidAmount}`);
        
        if (actualPayment === 50) {
          console.log(`✅ CORRECT: Player 1 paid with 1x $50 card (overpayment of $30)`);
        } else if (actualPayment === 60) {
          console.log(`❌ INCORRECT: Player 1 paid with 1x $10 + 1x $50 = $60 (overpayment of $40)`);
        } else if (actualPayment === 20) {
          console.log(`ℹ️  Player 1 paid exactly $20 (no overpayment needed)`);
        } else {
          console.log(`❌ UNEXPECTED: Player 1 paid $${actualPayment}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testManualHandScenario(); 