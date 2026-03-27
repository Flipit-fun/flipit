import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { flipCoin } from '@/lib/vrf';
import { sendPayout, calculatePayout } from '@/lib/payout';

export async function POST(req: NextRequest) {
    let body: { gameId?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    const { gameId } = body;
    if (!gameId) {
        return NextResponse.json({ error: 'missing_game_id' }, { status: 400 });
    }

    const { data: game, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

    if (error || !game) {
        return NextResponse.json({ error: 'game_not_found' }, { status: 404 });
    }

    // Security: Only allow flipping if payment is confirmed
    if (game.status !== 'paid') {
        return NextResponse.json(
            { error: 'payment_not_confirmed', status: game.status },
            { status: 400 }
        );
    }

    // Mark as flipping to prevent double-flip
    await supabase
        .from('games')
        .update({ status: 'flipped' })
        .eq('id', gameId);

    // Flip the coin using VRF
    const result = await flipCoin(gameId, game.choice, game.network);
    const outcome = result === game.choice ? 'win' : 'lose';

    let payoutTxn: string | null = null;
    let payoutAmount: number | null = null;

    if (outcome === 'win') {
        try {
            const payout = await sendPayout(game.payout_wallet, game.amount_sol, game.network);
            payoutTxn = payout.txnSignature;
            payoutAmount = payout.payoutAmount;
        } catch (e) {
            console.error('[game/flip] Payout failed:', e);
            // Still mark result but note payout failure
            await supabase
                .from('games')
                .update({
                    result,
                    outcome,
                    status: 'flipped',
                })
                .eq('id', gameId);
            return NextResponse.json(
                { error: 'payout_failed', result, outcome },
                { status: 500 }
            );
        }
    } else {
        payoutAmount = 0;
    }

    // Update final game state
    await supabase
        .from('games')
        .update({
            result,
            outcome,
            payout_txn: payoutTxn,
            status: 'complete',
        })
        .eq('id', gameId);

    return NextResponse.json({
        result,
        outcome,
        payoutTxn,
        payoutAmount: payoutAmount ?? calculatePayout(game.amount_sol),
    });
}
