// Utility to select payment cards for Kuhhandel auction
import type { Card } from '../types';

/**
 * Selects the optimal set of money cards to pay a required amount.
 * - If exact change is possible, returns that set.
 * - Otherwise, returns the set with the smallest overpayment.
 * @param cards Array of money cards
 * @param amount Amount to pay
 * @returns Array of card IDs to use for payment
 */
export function selectPaymentCards(cards: Card[], amount: number): string[] {
  // Only consider money cards
  const moneyCards = cards.filter(card => card.type === 'money');
  const n = moneyCards.length;
  let best: { ids: string[]; total: number } | null = null;

  // Try all subsets (2^n, n <= 7 is fine)
  for (let mask = 1; mask < (1 << n); mask++) {
    let total = 0;
    let ids: string[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        total += moneyCards[i].value;
        ids.push(moneyCards[i].id);
      }
    }
    if (total >= amount) {
      if (!best || total < best.total || (total === best.total && ids.length < best.ids.length)) {
        best = { ids, total };
      }
      // If exact match, prefer it
      if (total === amount) {
        return ids;
      }
    }
  }
  // If no combination found (shouldn't happen), return all cards
  return best ? best.ids : moneyCards.map(card => card.id);
} 