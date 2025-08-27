const API_BASE = 'http://localhost:3001/api/game';

async function testNormalPayment() {
  try {
    console.log('🧪 Testing Normal Payment (No Swordfish Bonus)...\n');
console.log('This will test the payment logic without Swordfish bonus interference\n');

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

    // Step 4: Start an auction (keep trying until we get a non-Swordfish card)
    console.log('4. Starting auction (looking for non-Swordfish card)...');
    let auctionGame;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`   Attempt ${attempts}...`);
      
      const auctionResponse = await fetch(`${API_BASE}/${gameId}/auction/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player1Id })
      });
      auctionGame = await auctionResponse.json();
      
      if (auctionGame.auctionCard?.name !== 'Swordfish') {
        console.log(`✅ Got non-Swordfish card: ${auctionGame.auctionCard?.name}`);
        break;
      } else {
        console.log(`   Got Swordfish card, trying again...`);
        // Clear the auction and try again
        await fetch(`${API_BASE}/${gameId}/auction/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    if (auctionGame.auctionCard?.name === 'Swordfish') {
      console.log(`❌ Could not get non-Swordfish card after ${maxAttempts} attempts`);
      return;
    }

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

    // Step 6: End auction (this puts it in match bid phase)
    console.log('6. Ending auction (entering match bid phase)...');
    const endResponse = await fetch(`${API_BASE}/${gameId}/auction/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const endGame = await endResponse.json();
    
    console.log(`✅ Auction ended`);
    console.log(`✅ Auction state: ${endGame.auctionState}\n`);

    // Step 7: Player 1 (auctioneer) matches the bid
    console.log('7. Player 1 (auctioneer) matching the bid...');
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

    // Step 8: Check payment results
    console.log('8. Checking payment results...');
    
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
      const expectedBidAmount = finalGame.auctionSummary?.bidAmount || 30;
      const winnerTotal = winnerMoneyCards.reduce((sum, card) => sum + card.value, 0);
      const auctioneerTotal = auctioneerMoneyCards.reduce((sum, card) => sum + card.value, 0);
      
      console.log(`\n📊 Payment Analysis:`);
      console.log(`Expected bid amount: $${expectedBidAmount}`);
      console.log(`Winner total card value: $${winnerTotal}`);
      console.log(`Auctioneer total card value: $${auctioneerTotal}`);
      
      // Check if the payment was correct
      if (winner.name === 'Player2') {
        // Player 2 won, so Player 1 (auctioneer) should have paid
        const player1InitialTotal = 90; // Starting money
        const player1FinalTotal = auctioneerTotal;
        const actualPayment = player1InitialTotal - player1FinalTotal;
        
        console.log(`\n🎯 Payment Analysis:`);
        console.log(`Player 1 initial total: $${player1InitialTotal}`);
        console.log(`Player 1 final total: $${player1FinalTotal}`);
        console.log(`Actual payment: $${actualPayment}`);
        console.log(`Expected payment: $${expectedBidAmount}`);
        console.log(`Overpayment: $${actualPayment - expectedBidAmount}`);
        
        if (actualPayment === expectedBidAmount) {
          console.log(`✅ CORRECT: Player 1 paid exactly $${expectedBidAmount}`);
        } else if (actualPayment > expectedBidAmount) {
          console.log(`❌ INCORRECT: Player 1 overpaid by $${actualPayment - expectedBidAmount}`);
        } else {
          console.log(`❌ INCORRECT: Player 1 underpaid by $${expectedBidAmount - actualPayment}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNormalPayment(); 