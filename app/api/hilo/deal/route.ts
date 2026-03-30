import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { drawCard, resolveHiLo } from '@/lib/deck';
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

    // Security: Only allow dealing if payment is confirmed
    if (game.status !== 'paid') {
        return NextResponse.json(
            { error: 'payment_not_confirmed', status: game.status },
            { status: 400 }
        );
    }

    // Mark as dealing (using 'flipped' status to reuse existing general states, or directly to complete)
    // We will use 'flipped' temporarily to prevent double-deal
    await supabase
        .from('games')
        .update({ status: 'flipped' })
        .eq('id', gameId);

    // Draw card and resolve
    const card = await drawCard();
    const outcome = resolveHiLo(card, game.choice as 'under' | 'over');
    const cardDrawnStr = `${card.value}${card.suit}`;

    let payoutTxn: string | null = null;
    let payoutAmount: number | null = null;

    if (outcome === 'win') {
        try {
            const payout = await sendPayout(game.payout_wallet, game.amount_sol, game.network);
            payoutTxn = payout.txnSignature;
            payoutAmount = payout.payoutAmount;
        } catch (e) {
            console.error('[hilo/deal] Payout failed:', e);
            // Still mark result but note payout failure
            await supabase
                .from('games')
                .update({
                    result: outcome,
                    outcome: outcome,
                    card_drawn: cardDrawnStr,
                    status: 'flipped', 
                })
                .eq('id', gameId);
            return NextResponse.json(
                { error: 'payout_failed', outcome, card },
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
            result: outcome, // storing 'win' 'lose' or 'bust' in result column too for history sake
            outcome: outcome,
            card_drawn: cardDrawnStr,
            payout_txn: payoutTxn,
            status: 'complete',
        })
        .eq('id', gameId);

    return NextResponse.json({
        card,
        outcome,
        payoutTxn,
        payoutAmount: payoutAmount || calculatePayout(game.amount_sol), // Only used for UI if win
    });
}
