import { getConnection } from './solana';
import { getHouseKeypair } from './wallet';
import { PublicKey } from '@solana/web3.js';

const LAMPORTS_PER_SOL = 1_000_000_000;
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export async function verifyPayment(
    amountSol: number,
    gameCreatedAt: string
): Promise<{ found: boolean; txnSignatures?: string[] }> {
    const connection = getConnection();
    const houseKeypair = getHouseKeypair();
    const housePublicKey = houseKeypair.publicKey;

    const gameTime = new Date(gameCreatedAt).getTime();
    const expectedLamports = Math.round(amountSol * LAMPORTS_PER_SOL);

    // Fetch recent signatures for house wallet
    const signatures = await connection.getSignaturesForAddress(housePublicKey, {
        limit: 50,
    });

    const matchingSignatures: string[] = [];
    let fetchCount = 0;
    const MAX_FETCHES = 25; // Increased limit for better coverage

    for (const sigInfo of signatures) {
        if (fetchCount >= MAX_FETCHES) break;

        const txTime = (sigInfo.blockTime ?? 0) * 1000;
        // If blockTime is missing, skip if transaction is very old (e.g. from previous fetch session)
        if (!sigInfo.blockTime) continue;

        if (txTime < gameTime - 120_000) continue; // Allow 2 min skew
        if (txTime > gameTime + FIFTEEN_MINUTES_MS) continue;

        fetchCount++;
        try {
            const tx = await connection.getTransaction(sigInfo.signature, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed',
            });
            if (!tx || tx.meta?.err) continue;

            const preBalances = tx.meta?.preBalances ?? [];
            const postBalances = tx.meta?.postBalances ?? [];
            const accountKeys =
                tx.transaction.message.getAccountKeys?.().staticAccountKeys ??
                (tx.transaction.message as any).accountKeys;

            const houseIndex = accountKeys.findIndex(
                (k: PublicKey) => k.toBase58() === housePublicKey.toBase58()
            );
            if (houseIndex === -1) continue;

            const diff = postBalances[houseIndex] - preBalances[houseIndex];
            if (diff >= expectedLamports - 5000 && diff <= expectedLamports + 5000) {
                console.log(`[verify] Match found: ${sigInfo.signature} (${diff / 1e9} SOL)`);
                matchingSignatures.push(sigInfo.signature);
            }
        } catch (e) {
            console.warn(`[verify] Failed to fetch txn ${sigInfo.signature}:`, e);
            continue;
        }
    }

    return {
        found: matchingSignatures.length > 0,
        txnSignatures: matchingSignatures,
    };
}
