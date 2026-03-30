import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { drawCard, Card } from '@/lib/deck';
import { calculatePayout, isBust, handValue, resolveBlackjack } from '@/lib/blackjack';
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

    // Hit mechanism
    const newCard = await drawCard();
    const playerHand = [...(game.player_hand || []), newCard];
    const handLog = [...(game.hand_log || []), { action: 'hit', target: 'player', card: newCard }];

    let newStatus = 'active';
    let outcome = null;
    let payoutAmount = 0;
    
    // Check if player busted
    const playerBusted = isBust(playerHand);

    if (playerBusted) {
        newStatus = 'complete';
        outcome = 'bust';
        payoutAmount = 0; // House wins immediately
    }

    const updateData: any = {
        player_hand: playerHand,
        hand_log: handLog,
        status: newStatus,
    };

    if (newStatus === 'complete') {
        updateData.outcome = outcome;
        updateData.payout_txn = null; // No payout for a bust
        updateData.is_push = false;
    }

    const { error: updateError } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', gameId);

    if (updateError) {
        console.error('[blackjack/hit] DB update failed:', updateError);
        return NextResponse.json({ error: 'db_update_failed' }, { status: 500 });
    }

    return NextResponse.json({
        card: newCard,
        playerHand,
        playerValue: handValue(playerHand),
        isBust: playerBusted
    });
}
