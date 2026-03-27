import { getConnection } from './solana';
import { getHouseKeypair } from './wallet';

export async function getPoolBalance(): Promise<number> {
    const connection = getConnection();
    const keypair = getHouseKeypair();
    const lamports = await connection.getBalance(keypair.publicKey);
    return lamports / 1e9; // Convert lamports to SOL
}
