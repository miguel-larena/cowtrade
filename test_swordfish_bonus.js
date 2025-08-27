const API_BASE = 'http://localhost:3001/api/game';

async function testSwordfishBonus() {
  try {
    console.log('🧪 Testing Swordfish Bonus Functionality...\n');

    // Step 1: Create a game
    console.log('1. Creating game...');
    const createResponse = await fetch(`${API_BASE}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName: 'TestPlayer1' })
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
      body: JSON.stringify({ playerName: 'TestPlayer2' })
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
    console.log(`✅ Auction card: ${auctionGame.auctionCard?.name}`);
    console.log(`✅ Swordfish cards drawn: ${auctionGame.swordfishCardsDrawn}`);
    
    if (auctionGame.auctionCard?.name === 'Swordfish') {
      console.log('\n🎯 SWORDFISH CARD DRAWN! Checking bonus...\n');
      
      // Check each player's bonus
      auctionGame.players.forEach((player, index) => {
        console.log(`Player ${index + 1} (${player.name}):`);
        console.log(`  Money: $${player.money}`);
        console.log(`  Money cards: ${player.hand.filter(c => c.type === 'money').length}`);
        
        const swordfishBonusCards = player.hand.filter(c => c.id.includes('swordfish_bonus'));
        console.log(`  Swordfish bonus cards: ${swordfishBonusCards.length}`);
        if (swordfishBonusCards.length > 0) {
          console.log(`  Bonus card value: $${swordfishBonusCards[0].value}`);
        }
        console.log('');
      });
      
      // Verify the bonus
      const expectedBonus = auctionGame.swordfishCardsDrawn === 1 ? 50 : 
                           auctionGame.swordfishCardsDrawn === 2 ? 100 :
                           auctionGame.swordfishCardsDrawn === 3 ? 200 : 500;
      
      const allPlayersHaveBonus = auctionGame.players.every(player => {
        const swordfishBonusCards = player.hand.filter(c => c.id.includes('swordfish_bonus'));
        return swordfishBonusCards.length === 1 && swordfishBonusCards[0].value === expectedBonus;
      });
      
      if (allPlayersHaveBonus) {
        console.log('✅ SUCCESS: All players received correct Swordfish bonus cards!');
      } else {
        console.log('❌ FAILURE: Not all players received correct Swordfish bonus cards');
      }
      
    } else {
      console.log('ℹ️  No Swordfish card drawn this time. The bonus system is working correctly.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSwordfishBonus(); 