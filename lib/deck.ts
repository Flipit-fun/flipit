export const SUITS = ['♠', '♥', '♦', '♣'] as const;
export const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

export type Card = { value: typeof VALUES[number]; suit: typeof SUITS[number]; numericValue: number };

const NUMERIC: Record<string, number> = {
  A: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
  '7': 7, '8': 8, '9': 9, '10': 10, J: 11, Q: 12, K: 13
};

let forcedQueue: string[] | null = null;
let lastForceCardsStr: string | undefined = undefined;

// Cryptographically random card draw
export async function drawCard(): Promise<Card> {
  const isDev = process.env.NODE_ENV === 'development';
  const forceCard = process.env.FORCE_CARD;
  const forceCards = process.env.FORCE_CARDS;

  if (isDev) {
    if (forceCards) {
      // Initialize or reset queue if env var changed
      if (forceCards !== lastForceCardsStr) {
        forcedQueue = forceCards.split(',').map(s => s.trim().toUpperCase());
        lastForceCardsStr = forceCards;
      }
      if (forcedQueue && forcedQueue.length > 0) {
        const val = forcedQueue.shift();
        if (val && VALUES.includes(val as any)) {
          return { value: val as any, suit: '♠', numericValue: NUMERIC[val] };
        }
      }
    }

    if (forceCard) {
      const val = forceCard.toUpperCase();
      if (VALUES.includes(val as any)) {
        return { value: val as any, suit: '♠', numericValue: NUMERIC[val] };
      }
    }
  }

  const { randomInt } = await import('crypto'); // Node.js built-in
  const valueIndex = randomInt(0, 13);
  const suitIndex = randomInt(0, 4);
  const value = VALUES[valueIndex];
  
  return { value, suit: SUITS[suitIndex], numericValue: NUMERIC[value] };
}

export function resolveHiLo(card: Card, guess: 'under' | 'over'): 'win' | 'lose' | 'bust' {
  if (card.numericValue === 7) return 'bust';
  if (guess === 'under' && card.numericValue < 7) return 'win';
  if (guess === 'over' && card.numericValue > 7) return 'win';
  return 'lose';
}
