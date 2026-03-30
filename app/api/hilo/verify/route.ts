import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPayment } from '@/lib/verify-payment';

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

    // If already confirmed, return immediately
    if (game.status === 'paid' || game.status === 'complete') {
        return NextResponse.json({
            status: 'confirmed',
            txnSignature: game.deposit_txn,
        });
    }

    if (game.status !== 'pending') {
        return NextResponse.json({ status: game.status });
    }

    // Check for expiry (15 min)
    const created = new Date(game.created_at).getTime();
    if (Date.now() > created + 15 * 60 * 1000) {
        return NextResponse.json({ status: 'expired' });
    }

    // Scan Solana for inbound payment
    const { found, txnSignatures } = await verifyPayment(
        game.amount_sol,
        game.created_at
    );

    if (!found || !txnSignatures || txnSignatures.length === 0) {
        return NextResponse.json({ status: 'pending' });
    }

    // Find the first signature that hasn't been claimed by another game
    let unclaimedSignature: string | null = null;

    for (const sig of txnSignatures) {
        const { data: existingGameWithTxn } = await supabase
            .from('games')
            .select('id')
            .eq('deposit_txn', sig)
            .neq('id', gameId)
            .maybeSingle();

        if (!existingGameWithTxn) {
            unclaimedSignature = sig;
            break;
        }
    }

    if (!unclaimedSignature) {
        // All matching transactions found so far are already claimed
        return NextResponse.json({ status: 'pending' });
    }

    // Update game to 'paid'
    await supabase
        .from('games')
        .update({ status: 'paid', deposit_txn: unclaimedSignature })
        .eq('id', gameId);

    return NextResponse.json({ status: 'confirmed', txnSignature: unclaimedSignature });
}
