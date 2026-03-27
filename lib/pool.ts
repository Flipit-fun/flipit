import { getConnection } from './solana';
import { getHouseKeypair } from './wallet';

export async function getPoolBalance(network?: string): Promise<number> {
    const connection = getConnection(network);
    const keypair = getHouseKeypair();
    const lamports = await connection.getBalance(keypair.publicKey);
    return lamports / 1e9; // Convert lamports to SOL
}
