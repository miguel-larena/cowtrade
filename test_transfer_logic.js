// Simple test to verify the payment logic
function testTransferLogic() {
  console.log('🧪 Testing Transfer Logic Directly...\n');
  
  // Simulate the exact scenario
  const fromPlayer = {
    name: 'Player1',
    money: 60,
    hand: [
      { id: 'money10_1', type: 'money', value: 10, name: '10' },
      { id: 'money50_1', type: 'money', value: 50, name: '50' }
    ]
  };
  
  const toPlayer = {
    name: 'Player2',
    money: 90,
    hand: []
  };
  
  const amount = 30;
  
  console.log(`Scenario: ${fromPlayer.name} needs to pay ${toPlayer.name} $${amount}`);
  console.log(`${fromPlayer.name} has: ${fromPlayer.hand.map(c => `$${c.value}`).join(', ')}`);
  console.log(`Expected: ${fromPlayer.name} should pay 1x $50 (overpayment of $20)\n`);
  
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
  
  // Choose the strategy with the least overpayment
  if (exactPaymentTotal >= amount && exactPaymentOverpayment <= singleCardOverpayment) {
    // Use exact payment strategy (less overpayment)
    console.log(`Using exact payment strategy (overpayment: $${exactPaymentOverpayment})`);
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
  } else if (smallestCoveringCard) {
    // Use single card strategy (less overpayment)
    console.log(`Using single card strategy (overpayment: $${singleCardOverpayment})`);
    const cardIndex = fromPlayer.hand.findIndex(c => c.id === smallestCoveringCard.id);
    if (cardIndex !== -1) {
      const removedCard = fromPlayer.hand.splice(cardIndex, 1)[0];
      console.log(`Removed card: ${removedCard.name} ($${removedCard.value}) - overpayment of $${removedCard.value - amount}`);
      
      toPlayer.hand.push(removedCard);
      transferredCards.push(removedCard);
      remainingAmount = 0; // Fully covered by this card
      
      console.log(`Remaining amount to transfer: $${remainingAmount}`);
    }
  }
  
  // Update money totals
  const actualTransferredAmount = amount - remainingAmount;
  fromPlayer.money -= actualTransferredAmount;
  toPlayer.money += actualTransferredAmount;
  
  console.log(`\n=== Transfer complete ===`);
  console.log(`Actual transferred amount: $${actualTransferredAmount}`);
  console.log(`${fromPlayer.name} hand after: ${fromPlayer.hand.map(c => `$${c.value}`).join(', ')}`);
  console.log(`${toPlayer.name} hand after: ${toPlayer.hand.map(c => `$${c.value}`).join(', ')}`);
  console.log(`${fromPlayer.name} money: $${fromPlayer.money}`);
  console.log(`${toPlayer.name} money: $${toPlayer.money}`);
  console.log(`Transferred cards: ${transferredCards.map(c => `$${c.value}`).join(', ')}`);
  
  // Check if the result is correct
  if (actualTransferredAmount === 50) {
    console.log(`\n✅ CORRECT: Player 1 paid with 1x $50 card (overpayment of $20)`);
  } else if (actualTransferredAmount === 40) {
    console.log(`\n❌ INCORRECT: Player 1 paid with 1x $10 + 1x $50 = $60 (overpayment of $30)`);
  } else {
    console.log(`\n❌ UNEXPECTED: Player 1 paid $${actualTransferredAmount}`);
  }
}

// Run the test
testTransferLogic(); 