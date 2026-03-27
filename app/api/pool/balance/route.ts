import { NextResponse } from 'next/server';
import { getPoolBalance } from '@/lib/pool';
import { NETWORK } from '@/lib/solana';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const balanceSol = await getPoolBalance();
        const maxBetSol = Math.floor((balanceSol / 2.0) * 100) / 100; // Round down to house safety
        return NextResponse.json({
            balanceSol,
            maxBetSol,
            network: NETWORK
        });
    } catch (error) {
        console.error('[pool/balance]', error);
        return NextResponse.json(
            { error: 'Failed to fetch pool balance' },
            { status: 500 }
        );
    }
}
