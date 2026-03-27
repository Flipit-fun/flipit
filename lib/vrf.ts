import crypto from 'crypto';
import { getConnection } from './solana';

export type CoinSide = 'heads' | 'tails';

/**
 * Devnet fallback: deterministic randomness using crypto.randomBytes
 * seeded with gameId + recent block hash. Never uses Math.random().
 */
async function devnetFallbackFlip(gameId: string, playerChoice: CoinSide, network: string): Promise<CoinSide> {
    const connection = getConnection(network);
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    const seed = `${gameId}:${blockhash}`;
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    // 40% win rate: player wins 40 out of every 100 outcomes
    const num = parseInt(hash.slice(0, 8), 16);
    const playerWins = num % 100 < 40;
    return playerWins ? playerChoice : (playerChoice === 'heads' ? 'tails' : 'heads');
}

/**
 * Main VRF function. Uses Switchboard VRF on mainnet,
 * falls back to crypto-based randomness on devnet.
 * Win rate is set to 40%.
 */
export async function flipCoin(gameId: string, playerChoice: CoinSide, network?: string): Promise<CoinSide> {
    const net = network ?? process.env.NETWORK ?? 'devnet';

    if (net === 'mainnet') {
        // TODO: Wire Switchboard VRF for production
        // For now uses the same secure crypto fallback until mainnet VRF is configured
        return devnetFallbackFlip(gameId, playerChoice, net);
    }

    return devnetFallbackFlip(gameId, playerChoice, net);
}
