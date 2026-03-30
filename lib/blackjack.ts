import { drawCard, Card } from './deck'

// Calculate best hand value (handles soft Aces)
export function handValue(hand: Card[]): number {
  let total = 0
  let aces = 0

  for (const card of hand) {
    if (card.value === 'A') {
      aces++
      total += 11
    } else {
      total += Math.min(card.numericValue, 10) // J,Q,K all = 10
    }
  }

  // Downgrade Aces from 11 to 1 as needed to avoid bust
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }

  return total
}

export function isSoftHand(hand: Card[]): boolean {
  // True if hand contains an Ace counted as 11
  const total = handValue(hand)
  const hardTotal = hand.reduce((sum, c) => sum + (c.value === 'A' ? 1 : Math.min(c.numericValue, 10)), 0)
  return total !== hardTotal
}

export function isBlackjack(hand: Card[]): boolean {
  if (hand.length !== 2) return false
  const values = hand.map(c => c.value)
  const hasAce = values.includes('A')
  const hasTen = hand.some(c => ['10','J','Q','K'].includes(c.value))
  return hasAce && hasTen
}

export function isBust(hand: Card[]): boolean {
  return handValue(hand) > 21
}

// Dealer draws until 17+ (stands on soft 17)
export async function dealerDraw(hand: Card[]): Promise<Card[]> {
  const result = [...hand]
  while (handValue(result) < 17) {
    result.push(await drawCard())
  }
  return result
}

export type GameOutcome = 'blackjack' | 'win' | 'lose' | 'push' | 'bust'

export function resolveBlackjack(playerHand: Card[], dealerHand: Card[]): GameOutcome {
  const playerVal = handValue(playerHand)
  const dealerVal = handValue(dealerHand)

  if (isBust(playerHand)) return 'bust'
  if (isBlackjack(playerHand) && !isBlackjack(dealerHand)) return 'blackjack'
  if (isBust(dealerHand)) return 'win'
  if (playerVal > dealerVal) return 'win'
  if (playerVal === dealerVal) return 'push'
  return 'lose'
}

export function calculatePayout(betAmount: number, outcome: GameOutcome): number {
  switch (outcome) {
    case 'blackjack': return betAmount * 1.5   // natural blackjack
    case 'win':       return betAmount * 2      // standard win
    case 'push':      return betAmount          // tie — return stake
    case 'bust':
    case 'lose':      return 0                  // house wins
  }
}
