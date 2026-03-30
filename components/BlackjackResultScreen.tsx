'use client';

import SolanaLogo from './SolanaLogo';

interface BlackjackResultScreenProps {
    outcome: 'blackjack' | 'win' | 'lose' | 'push' | 'bust';
    payoutAmount: number;
    payoutTxn?: string | null;
    network: 'mainnet' | 'devnet';
    onPlayAgain: () => void;
}

export default function BlackjackResultScreen({
    outcome,
    payoutAmount,
    payoutTxn,
    network,
    onPlayAgain
}: BlackjackResultScreenProps) {
    let bgColor = '';
    let textColor = '';
    let title = '';
    let subtitle = '';

    if (outcome === 'blackjack') {
        bgColor = 'bg-yellow-400';
        textColor = 'text-black';
        title = 'Blackjack!';
        subtitle = `You won ${payoutAmount.toFixed(4)} SOL`;
    } else if (outcome === 'win') {
        bgColor = 'bg-[#16A34A]';
        textColor = 'text-white';
        title = 'You win!';
        subtitle = `${payoutAmount.toFixed(4)} SOL sent`;
    } else if (outcome === 'push') {
        bgColor = 'bg-gray-500';
        textColor = 'text-white';
        title = 'Push';
        subtitle = `SOL returned`;
    } else if (outcome === 'lose') {
        bgColor = 'bg-[#DC2626]';
        textColor = 'text-white';
        title = 'Dealer wins';
        subtitle = 'Better luck next hand';
    } else if (outcome === 'bust') {
        bgColor = 'bg-[#DC2626]';
        textColor = 'text-white';
        title = 'Bust!';
        subtitle = 'You went over 21';
    }

    return (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 ${bgColor} ${textColor} animate-in fade-in zoom-in duration-300`}>
            <div className="text-center max-w-sm w-full">
                <h2 className="text-5xl font-black mb-2 tracking-tight drop-shadow-sm">{title}</h2>
                <div className="flex items-center justify-center gap-2 mb-8 text-xl font-mono opacity-90 font-bold">
                    {(outcome === 'win' || outcome === 'blackjack' || outcome === 'push') && (
                        <SolanaLogo className={`w-5 h-5 ${outcome === 'blackjack' ? 'text-black' : 'text-white'}`} />
                    )}
                    <span>{subtitle}</span>
                </div>

                {payoutTxn && (
                    <a
                        href={`https://solscan.io/tx/${payoutTxn}?cluster=${network}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-mono font-bold uppercase tracking-wider mb-3 transition-opacity hover:opacity-90 ${outcome === 'blackjack' ? 'bg-black text-yellow-400' : 'bg-white text-black'}`}
                    >
                        View Txn →
                    </a>
                )}

                <button
                    onClick={onPlayAgain}
                    className={`w-full py-4 rounded-xl font-mono font-bold uppercase tracking-wider border-2 transition-all hover:bg-black/10`}
                    style={{ borderColor: outcome === 'blackjack' ? 'black' : 'white', color: outcome === 'blackjack' ? 'black' : 'white' }}
                >
                    Play Again
                </button>
            </div>
        </div>
    );
}
