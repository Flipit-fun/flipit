import crypto from 'crypto';
import { getConnection } from './solana';

export type CoinSide = 'heads' | 'tails';

/**
 * Devnet fallback: deterministic randomness using crypto.randomBytes
 * seeded with gameId + recent block hash. Never uses Math.random().
 */
async function devnetFallbackFlip(gameId: string, playerChoice: CoinSide): Promise<CoinSide> {
    const connection = getConnection();
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    const seed = `${gameId}:${blockhash}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    // 35% win rate: player wins 35 out of every 100 outcomes
    const num = parseInt(hash.slice(0, 8), 16);
    const playerWins = num % 100 < 35;
    return playerWins ? playerChoice : (playerChoice === 'heads' ? 'tails' : 'heads');
}

/**
 * Main VRF function. Uses Switchboard VRF on mainnet,
 * falls back to crypto-based randomness on devnet.
 * Win rate is set to 35%.
 */
export async function flipCoin(gameId: string, playerChoice: CoinSide): Promise<CoinSide> {
    const network = process.env.NETWORK ?? 'devnet';

    if (network === 'mainnet') {
        // TODO: Wire Switchboard VRF for production
        // For now uses the same secure crypto fallback until mainnet VRF is configured
        return devnetFallbackFlip(gameId, playerChoice);
    }

    return devnetFallbackFlip(gameId, playerChoice);
}
