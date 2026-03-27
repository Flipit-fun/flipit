import { Connection } from '@solana/web3.js';

export function getConnection(): Connection {
    const network = process.env.NETWORK ?? 'devnet';
    const rpc =
        network === 'mainnet'
            ? process.env.SOLANA_RPC_MAINNET!
            : (process.env.SOLANA_RPC_DEVNET ?? 'https://api.devnet.solana.com');

    return new Connection(rpc, 'confirmed');
}

export const NETWORK = process.env.NETWORK ?? 'devnet';
