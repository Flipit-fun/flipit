import { NextRequest, NextResponse } from 'next/server';
import { getPoolBalance } from '@/lib/pool';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const network = searchParams.get('network') ?? 'devnet';

    try {
        let balanceSol: number;
        if (network === 'devnet') {
            balanceSol = 1_000_000; // Mock infinite balance for Demo
        } else {
            balanceSol = await getPoolBalance(network);
        }
        
        const maxBetSol = network === 'devnet' ? 100_000 : Math.floor((balanceSol / 2.0) * 100) / 100; // Round down to house safety
        return NextResponse.json({
            balanceSol,
            maxBetSol,
            network
        });
    } catch (error) {
        console.error('[pool/balance]', error);
        return NextResponse.json(
            { error: 'Failed to fetch pool balance' },
            { status: 500 }
        );
    }
}
