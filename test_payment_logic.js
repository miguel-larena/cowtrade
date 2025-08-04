const API_BASE = 'http://localhost:3001/api/game';

async function testPaymentLogic() {
  try {
    console.log('🧪 Testing Payment Logic...\n');

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
    console.log(`✅ Player 1 ID: ${player1Id}`);
    console.log(`✅ Initial money: $${game.players[0].money}`);
    console.log(`✅ Initial money cards: ${game.players[0].hand.filter(c => c.type === 'money').length}\n`);

    // Step 2: Join with second player
    console.log('2. Joining with second player...');
    const joinResponse = await fetch(`${API_BASE}/${gameId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: 'Player2' })
    });
    const gameWithTwoPlayers = await joinResponse.json();
    const player2Id = gameWithTwoPlayers.players[1].id;
    console.log(`✅ Player 2 joined: ${player2Id}`);
    console.log(`✅ Player 2 initial money: $${gameWithTwoPlayers.players[1].money}`);
    console.log(`✅ Player 2 initial money cards: ${gameWithTwoPlayers.players[1].hand.filter(c => c.type === 'money').length}\n`);

    // Step 3: Start the game
    console.log('3. Starting game...');
    const startResponse = await fetch(`${API_BASE}/${gameId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const startedGame = await startResponse.json();
    console.log(`✅ Game started. Current phase: ${startedGame.currentPhase}\n`);

    // Step 4: Start an auction
    console.log('4. Starting auction...');
    const auctionResponse = await fetch(`${API_BASE}/${gameId}/auction/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: player1Id })
    });
    const auctionGame = await auctionResponse.json();
    
    console.log(`✅ Auction started`);
    console.log(`✅ Auction card: ${auctionGame.auctionCard?.name}\n`);

    // Step 5: Player 2 bids $30
    console.log('5. Player 2 bidding $30...');
    const bidResponse = await fetch(`${API_BASE}/${gameId}/auction/bid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: player2Id, amount: 30 })
    });
    const bidGame = await bidResponse.json();
    console.log(`✅ Bid placed: $${bidGame.currentBid}`);
    console.log(`✅ Current bidder: ${bidGame.currentBidder}\n`);

    // Step 6: End auction
    console.log('6. Ending auction...');
    const endResponse = await fetch(`${API_BASE}/${gameId}/auction/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const endGame = await endResponse.json();
    
    console.log(`✅ Auction ended`);
    console.log(`✅ Winner: ${endGame.auctionSummary?.winnerName}`);
    console.log(`✅ Bid amount: $${endGame.auctionSummary?.bidAmount}`);
    console.log(`✅ Summary: ${endGame.auctionSummary?.message}\n`);

    // Step 7: Check payment results
    console.log('7. Checking payment results...');
    
    // Find the winner and auctioneer
    const winner = endGame.players.find(p => p.id === endGame.currentBidder);
    const auctioneer = endGame.players.find(p => p.id === endGame.auctioneer);
    
    if (winner && auctioneer) {
      console.log(`Winner (${winner.name}):`);
      console.log(`  Money: $${winner.money}`);
      console.log(`  Money cards: ${winner.hand.filter(c => c.type === 'money').length}`);
      console.log(`  Money card values: ${winner.hand.filter(c => c.type === 'money').map(c => `$${c.value}`).join(', ')}`);
      
      console.log(`\nAuctioneer (${auctioneer.name}):`);
      console.log(`  Money: $${auctioneer.money}`);
      console.log(`  Money cards: ${auctioneer.hand.filter(c => c.type === 'money').length}`);
      console.log(`  Money card values: ${auctioneer.hand.filter(c => c.type === 'money').map(c => `$${c.value}`).join(', ')}`);
      
      // Check if the payment logic worked correctly
      const expectedBidAmount = endGame.auctionSummary?.bidAmount || 30;
      const winnerMoneyCards = winner.hand.filter(c => c.type === 'money');
      const auctioneerMoneyCards = auctioneer.hand.filter(c => c.type === 'money');
      
      console.log(`\n📊 Payment Analysis:`);
      console.log(`Expected bid amount: $${expectedBidAmount}`);
      console.log(`Winner money cards: ${winnerMoneyCards.length} cards`);
      console.log(`Auctioneer money cards: ${auctioneerMoneyCards.length} cards`);
      
      // Check if the payment was optimal
      const totalWinnerCards = winnerMoneyCards.reduce((sum, card) => sum + card.value, 0);
      const totalAuctioneerCards = auctioneerMoneyCards.reduce((sum, card) => sum + card.value, 0);
      
      console.log(`Winner total card value: $${totalWinnerCards}`);
      console.log(`Auctioneer total card value: $${totalAuctioneerCards}`);
      
      if (totalWinnerCards + totalAuctioneerCards === 180) { // 90 + 90 initial
        console.log(`✅ Payment logic working correctly - total money cards preserved`);
      } else {
        console.log(`❌ Payment logic issue - total money cards changed`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPaymentLogic(); 