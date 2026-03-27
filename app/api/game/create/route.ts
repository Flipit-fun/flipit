import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { supabase } from '@/lib/supabase';
import { getPoolBalance } from '@/lib/pool';
import { getHousePublicKey } from '@/lib/wallet';
import { NETWORK } from '@/lib/solana';
import crypto from 'crypto';

// Simple in-memory rate limiter: { ipHash -> lastRequestTime }
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5_000; // Reduced to 5 seconds for better UX

function hashIp(ip: string): string {
    return crypto.createHash('sha256').update(ip).digest('hex');
}

export async function POST(req: NextRequest) {
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        '127.0.0.1';
    const ipHash = hashIp(ip);

    // Rate limiting
    const lastReq = rateLimitMap.get(ipHash) ?? 0;
    const now = Date.now();
    if (now - lastReq < RATE_LIMIT_MS) {
        const retryAfter = Math.ceil((RATE_LIMIT_MS - (now - lastReq)) / 1000);
        return NextResponse.json(
            { error: 'rate_limited', retryAfter },
            { status: 429 }
        );
    }
    rateLimitMap.set(ipHash, now);

    let body: { amount?: number; choice?: string; payoutWallet?: string; network?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    const { amount, choice, payoutWallet, network } = body;
    const selectedNetwork = network === 'mainnet' ? 'mainnet' : 'devnet';

    // Validate inputs (Slider allows 0.05 to 2.0 with 0.01 steps)
    if (!amount || typeof amount !== 'number' || amount < 0.05 || amount > 2.0) {
        return NextResponse.json({ error: 'invalid_amount' }, { status: 400 });
    }

    if (!choice || !['heads', 'tails'].includes(choice)) {
        return NextResponse.json({ error: 'invalid_choice' }, { status: 400 });
    }

    if (!payoutWallet) {
        return NextResponse.json(
            { error: 'missing_payout_wallet' },
            { status: 400 }
        );
    }

    // Validate payout wallet address
    try {
        const pubkey = new PublicKey(payoutWallet);
        if (!PublicKey.isOnCurve(pubkey.toBytes())) {
            throw new Error('Not on curve');
        }
    } catch {
        return NextResponse.json(
            { error: 'invalid_payout_wallet' },
            { status: 400 }
        );
    }

    try {
        const poolBalance = await getPoolBalance(selectedNetwork);
        if (poolBalance < amount * 2) {
            return NextResponse.json(
                { error: 'pool_insufficient' },
                { status: 503 }
            );
        }
    } catch {
        return NextResponse.json(
            { error: 'pool_check_failed' },
            { status: 500 }
        );
    }

    // Insert game into Supabase
    const depositAddress = getHousePublicKey();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data: game, error: dbError } = await supabase
        .from('games')
        .insert({
            network: selectedNetwork,
            amount_sol: amount,
            choice,
            payout_wallet: payoutWallet,
            status: 'pending',
            ip_hash: ipHash,
        })
        .select()
        .single();

    if (dbError || !game) {
        console.error('[game/create] DB error:', dbError);
        return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    return NextResponse.json({
        gameId: game.id,
        depositAddress,
        expiresAt,
    });
}
