import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { drawCard } from '@/lib/deck';
import { calculatePayout, isBlackjack, resolveBlackjack } from '@/lib/blackjack';
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

    if (game.status === 'active' || game.status === 'complete') {
        return NextResponse.json({ error: 'game_already_started' }, { status: 400 });
    }

    if (game.status !== 'paid') {
        return NextResponse.json({ error: 'payment_not_confirmed' }, { status: 400 });
    }

    if (game.game_type !== 'blackjack') {
        return NextResponse.json({ error: 'invalid_game_type' }, { status: 400 });
    }

    // Deal initial cards
    const playerCard1 = await drawCard();
    const playerCard2 = await drawCard();
    const dealerCardVisible = await drawCard();
    const dealerCardHidden = await drawCard();

    const playerHand = [playerCard1, playerCard2];
    const dealerHand = [dealerCardVisible, dealerCardHidden];
    const handLog = [
        { action: 'deal', target: 'player', card: playerCard1 },
        { action: 'deal', target: 'player', card: playerCard2 },
        { action: 'deal', target: 'dealer', card: dealerCardVisible },
        { action: 'deal', target: 'dealer', card: dealerCardHidden, hidden: true },
    ];

    let newStatus = 'active';
    let outcome = null;
    let payoutAmount = 0;
    let payoutTxn = null;
    let isPush = false;

    // Check for natural blackjack logic
    const playerHasBJ = isBlackjack(playerHand);
    const dealerHasBJ = isBlackjack(dealerHand);

    if (playerHasBJ || dealerHasBJ) {
        newStatus = 'complete';
        if (playerHasBJ && !dealerHasBJ) {
            outcome = 'blackjack';
        } else if (playerHasBJ && dealerHasBJ) {
            outcome = 'push';
            isPush = true;
        } else if (!playerHasBJ && dealerHasBJ) {
            outcome = 'lose';
        }
        
        if (outcome) {
            payoutAmount = calculatePayout(game.amount_sol, outcome as any);
        }

        // Issue payout if needed
        if (payoutAmount > 0) {
            try {
                payoutTxn = await sendPayout(
                    game.payout_wallet,
                    payoutAmount,
                    game.network === 'mainnet' ? 'mainnet' : 'devnet'
                );
            } catch (e) {
                console.error('[blackjack/start] Payout failed:', e);
            }
        }
    }

    const updateData: any = {
        player_hand: playerHand,
        dealer_hand: dealerHand,
        hand_log: handLog,
        status: newStatus,
    };

    if (newStatus === 'complete') {
        updateData.outcome = outcome;
        updateData.payout_txn = payoutTxn;
        updateData.is_push = isPush;
    }

    const { error: updateError } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', gameId);

    if (updateError) {
        console.error('[blackjack/start] Final update failed:', updateError);
        return NextResponse.json({ error: 'db_update_failed' }, { status: 500 });
    }

    return NextResponse.json({
        playerHand,
        dealerVisible: dealerCardVisible,
        isBlackjack: newStatus === 'complete',
        outcome,
        payoutAmount,
        payoutTxn,
        dealerHand: newStatus === 'complete' ? dealerHand : undefined // Only expose dealer hand if complete
    });
}
