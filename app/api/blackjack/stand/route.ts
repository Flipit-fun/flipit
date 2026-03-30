import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { dealerDraw, calculatePayout, resolveBlackjack, handValue } from '@/lib/blackjack';
import { sendPayout } from '@/lib/payout';

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

    if (game.status !== 'active') {
        return NextResponse.json({ error: 'game_not_active' }, { status: 400 });
    }

    const playerHand = game.player_hand || [];
    let dealerHand = game.dealer_hand || [];
    const handLog = game.hand_log || [];

    // Dealer draw sequence
    dealerHand = await dealerDraw(dealerHand);
    
    // Log new dealer cards
    if (dealerHand.length > 2) {
        for (let i = 2; i < dealerHand.length; i++) {
            handLog.push({ action: 'hit', target: 'dealer', card: dealerHand[i] });
        }
    }

    const outcome = resolveBlackjack(playerHand, dealerHand);
    const payoutAmount = calculatePayout(game.amount_sol, outcome);
    const isPush = outcome === 'push';
    let payoutTxn = null;

    if (payoutAmount > 0) {
        try {
            payoutTxn = await sendPayout(
                game.payout_wallet,
                payoutAmount,
                game.network === 'mainnet' ? 'mainnet' : 'devnet'
            );
        } catch (e) {
            console.error('[blackjack/stand] Payout failed:', e);
        }
    }

    const updateData = {
        dealer_hand: dealerHand,
        hand_log: handLog,
        status: 'complete',
        outcome,
        payout_txn: payoutTxn,
        is_push: isPush
    };

    const { error: updateError } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', gameId);

    if (updateError) {
        console.error('[blackjack/stand] update error:', updateError);
        return NextResponse.json({ error: 'db_update_failed' }, { status: 500 });
    }

    return NextResponse.json({
        dealerHand,
        dealerValue: handValue(dealerHand),
        outcome,
        payoutAmount,
        payoutTxn
    });
}
