import {
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getConnection } from './solana';
import { getHouseKeypair } from './wallet';

const HOUSE_EDGE_PERCENT = parseInt(
    process.env.HOUSE_EDGE_PERCENT ?? '5',
    10
);

export function calculatePayout(amountSol: number): number {
    return amountSol * 2 * (1 - HOUSE_EDGE_PERCENT / 100);
}

export async function sendPayout(
    toAddress: string,
    amountSol: number
): Promise<{ txnSignature: string; payoutAmount: number }> {
    const connection = getConnection();
    const houseKeypair = getHouseKeypair();
    const payoutAmount = calculatePayout(amountSol);

    const toPubkey = new PublicKey(toAddress);

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: houseKeypair.publicKey,
            toPubkey,
            lamports: Math.floor(payoutAmount * LAMPORTS_PER_SOL),
        })
    );

    const txnSignature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [houseKeypair],
        { commitment: 'confirmed' }
    );

    return { txnSignature, payoutAmount };
}
