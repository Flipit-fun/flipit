import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

let _keypair: Keypair | null = null;

export function getHouseKeypair(): Keypair {
    if (_keypair) return _keypair;

    const privateKeyBase58 = process.env.FLIP_WALLET_PRIVATE_KEY;
    if (!privateKeyBase58) {
        throw new Error('FLIP_WALLET_PRIVATE_KEY is not set');
    }

    const secretKey = bs58.decode(privateKeyBase58);
    _keypair = Keypair.fromSecretKey(secretKey);
    return _keypair;
}

export function getHousePublicKey(): string {
    return getHouseKeypair().publicKey.toBase58();
}
