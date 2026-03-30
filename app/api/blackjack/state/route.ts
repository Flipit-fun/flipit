import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { handValue } from '@/lib/blackjack';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

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

    const response: any = {
        status: game.status,
    };

    if (game.status === 'active' || game.status === 'complete') {
        response.playerHand = game.player_hand || [];
        response.playerValue = handValue(game.player_hand || []);
        
        // Expose dealer hidden card only if complete
        if (game.status === 'active' && game.dealer_hand?.length >= 1) {
            response.dealerVisible = game.dealer_hand[0];
            // Optionally could send the concealed one without type info
            // response.dealerHand = [game.dealer_hand[0], { hidden: true }];
        } else if (game.status === 'complete') {
            response.dealerHand = game.dealer_hand || [];
            response.dealerValue = handValue(game.dealer_hand || []);
            response.outcome = game.outcome;
            response.payoutAmount = game.status === 'complete' && game.payout_txn ? game.amount_sol * (game.outcome === 'blackjack' ? 1.5 : 2) : 0; // naive reconstruction if needed
        }
    }

    return NextResponse.json(response);
}
