import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy client — only instantiated at runtime, not at build-time module eval
let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
    if (_client) return _client;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Supabase env vars are not set');
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
    return _client;
}

// Convenience proxy — same interface, zero-cost abstraction
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return (getSupabaseClient() as any)[prop];
    },
});

export type GameStatus = 'pending' | 'paid' | 'flipped' | 'complete';

export type Game = {
    id: string;
    created_at: string;
    network: string;
    amount_sol: number;
    choice: string;
    payout_wallet: string;
    deposit_txn: string | null;
    result: string | null;
    outcome: string | null;
    payout_txn: string | null;
    status: GameStatus;
    ip_hash: string | null;
};
