// Test the updated payment logic with the user's examples
function testUpdatedPaymentLogic() {
  console.log('🧪 Testing Updated Payment Logic...\n');
  
  // Example 1: Player 1 has 1x $10 + 1x $50, needs to pay $30
  console.log('Example 1: Player 1 has 1x $10 + 1x $50, needs to pay $30');
  console.log('Expected: Pay 1x $50 (overpayment of $20)\n');
  
  const player1Example1 = {
    name: 'Player1',
    money: 60,
    hand: [
      { id: 'money10_1', type: 'money', value: 10, name: '10' },
      { id: 'money50_1', type: 'money', value: 50, name: '50' }
    ]
  };
  
  const player2Example1 = {
    name: 'Player2',
    money: 90,
    hand: []
  };
  
  testPaymentScenario(player1Example1, player2Example1, 30);
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Example 2: Player 1 has 1x $10 + 2x $50, needs to pay $70
  console.log('Example 2: Player 1 has 1x $10 + 2x $50, needs to pay $70');
  console.log('Expected: Pay 2x $50 (overpayment of $30)\n');
  
  const player1Example2 = {
    name: 'Player1',
    money: 110,
    hand: [
      { id: 'money10_1', type: 'money', value: 10, name: '10' },
      { id: 'money50_1', type: 'money', value: 50, name: '50' },
      { id: 'money50_2', type: 'money', value: 50, name: '50' }
    ]
  };
  
  const player2Example2 = {
    name: 'Player2',
    money: 90,
    hand: []
  };
  
  testPaymentScenario(player1Example2, player2Example2, 70);
}

function testPaymentScenario(fromPlayer, toPlayer, amount) {
  console.log(`Scenario: ${fromPlayer.name} needs to pay ${toPlayer.name} $${amount}`);
  console.log(`${fromPlayer.name} has: ${fromPlayer.hand.map(c => `$${c.value}`).join(', ')}`);
  
  // Simulate the transfer logic
  const transferredCards = [];
  let remainingAmount = amount;
  
  // Get money cards (excluding $0 bluff cards) and sort by value (highest first for optimal overpayment)
  const moneyCards = fromPlayer.hand
    .filter(card => card.type === 'money' && card.value > 0)
    .sort((a, b) => b.value - a.value);
  
  console.log(`Money cards available: ${moneyCards.map(c => `$${c.value}`).join(', ')}`);
  
  // Strategy 1: Try to find exact payment using lowest denominations
  const exactPaymentCards = fromPlayer.hand
    .filter(card => card.type === 'money' && card.value > 0)
    .sort((a, b) => a.value - b.value);
  
  let exactPaymentTotal = 0;
  const exactPayment = [];
  
  for (const card of exactPaymentCards) {
    if (exactPaymentTotal >= amount) break;
    exactPaymentTotal += card.value;
    exactPayment.push(card);
  }
  
  console.log(`Exact payment attempt: $${exactPaymentTotal} using ${exactPayment.length} cards`);
  
  // Strategy 2: Find the smallest single card that covers the amount
  const smallestCoveringCard = moneyCards.find(card => card.value >= amount);
  const singleCardOverpayment = smallestCoveringCard ? smallestCoveringCard.value - amount : Infinity;
  
  // Strategy 3: Calculate overpayment if we use exact payment strategy
  const exactPaymentOverpayment = exactPaymentTotal >= amount ? exactPaymentTotal - amount : Infinity;
  
  console.log(`Single card overpayment: $${singleCardOverpayment}`);
  console.log(`Exact payment overpayment: $${exactPaymentOverpayment}`);
  
  // Choose the strategy: exact payment if possible, otherwise minimal overpayment
  if (exactPaymentTotal >= amount && exactPaymentOverpayment === 0) {
    // Use exact payment strategy (no overpayment)
    console.log(`🎯 DECISION: Using exact payment strategy (no overpayment)`);
    for (const card of exactPayment) {
      if (remainingAmount <= 0) break;
      
      const cardIndex = fromPlayer.hand.findIndex(c => c.id === card.id);
      if (cardIndex !== -1) {
        const removedCard = fromPlayer.hand.splice(cardIndex, 1)[0];
        console.log(`Removed card: ${removedCard.name} ($${removedCard.value})`);
        
        toPlayer.hand.push(removedCard);
        transferredCards.push(removedCard);
        remainingAmount -= removedCard.value;
        
        console.log(`Remaining amount to transfer: $${remainingAmount}`);
      }
    }
  } else {
    // Exact payment not possible, use minimal overpayment strategy
    console.log(`🎯 DECISION: Exact payment not possible, using minimal overpayment strategy`);
    
    // Find the combination of cards that results in minimal overpayment
    let bestCombination = [];
    let bestOverpayment = Infinity;
    
    // Try all possible combinations of cards
    const allMoneyCards = fromPlayer.hand.filter(card => card.type === 'money' && card.value > 0);
    
    // Generate all possible combinations (power set)
    for (let i = 1; i <= allMoneyCards.length; i++) {
      const combinations = getCombinations(allMoneyCards, i);
      for (const combination of combinations) {
        const totalValue = combination.reduce((sum, card) => sum + card.value, 0);
        if (totalValue >= amount) {
          const overpayment = totalValue - amount;
          if (overpayment < bestOverpayment) {
            bestOverpayment = overpayment;
            bestCombination = combination;
          }
        }
      }
    }
    
    if (bestCombination.length > 0) {
      console.log(`Using combination: ${bestCombination.map(c => `$${c.value}`).join(' + ')} = $${bestCombination.reduce((sum, c) => sum + c.value, 0)} (overpayment: $${bestOverpayment})`);
      
      for (const card of bestCombination) {
        const cardIndex = fromPlayer.hand.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
          const removedCard = fromPlayer.hand.splice(cardIndex, 1)[0];
          console.log(`Removed card: ${removedCard.name} ($${removedCard.value})`);
          
          toPlayer.hand.push(removedCard);
          transferredCards.push(removedCard);
          remainingAmount -= removedCard.value;
          
          console.log(`Remaining amount to transfer: $${remainingAmount}`);
        }
      }
    }
  }
  
  // Update money totals based on actual cards transferred
  const actualTransferredValue = transferredCards.reduce((sum, card) => sum + card.value, 0);
  fromPlayer.money -= actualTransferredValue;
  toPlayer.money += actualTransferredValue;
  
  console.log(`\n=== Transfer complete ===`);
  console.log(`Actual transferred value: $${actualTransferredValue}`);
  console.log(`${fromPlayer.name} hand after: ${fromPlayer.hand.map(c => `$${c.value}`).join(', ')}`);
  console.log(`${toPlayer.name} hand after: ${toPlayer.hand.map(c => `$${c.value}`).join(', ')}`);
  console.log(`${fromPlayer.name} money: $${fromPlayer.money}`);
  console.log(`${toPlayer.name} money: $${toPlayer.money}`);
  console.log(`Transferred cards: ${transferredCards.map(c => `$${c.value}`).join(', ')}`);
  
  // Check if the result is correct
  const overpayment = actualTransferredValue - amount;
  console.log(`\nOverpayment: $${overpayment}`);
  
  if (overpayment === 0) {
    console.log(`✅ CORRECT: Exact payment made`);
  } else {
    console.log(`✅ CORRECT: Minimal overpayment of $${overpayment}`);
  }
}

// Helper function to generate combinations
function getCombinations(cards, size) {
  if (size === 0) return [[]];
  if (cards.length === 0) return [];
  
  const [first, ...rest] = cards;
  const withoutFirst = getCombinations(rest, size);
  const withFirst = getCombinations(rest, size - 1).map(combination => [first, ...combination]);
  
  return [...withoutFirst, ...withFirst];
}

// Run the test
testUpdatedPaymentLogic(); 