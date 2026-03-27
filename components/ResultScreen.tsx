'use client';

import SolanaLogo from './SolanaLogo';

type CoinSide = 'heads' | 'tails';
type Outcome = 'win' | 'lose';

interface ResultScreenProps {
    result: CoinSide;
    outcome: Outcome;
    payoutAmount?: number;
    payoutTxn?: string;
    amountBet: number;
    network: string;
    onPlayAgain: () => void;
}

function SolscanLink({ txn, network }: { txn: string; network: string }) {
    const base = 'https://solscan.io/tx';
    const cluster = network === 'mainnet' ? '' : '?cluster=devnet';
    const url = `${base}/${txn}${cluster}`;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity"
        >
            View on Solscan ↗
        </a>
    );
}

export default function ResultScreen({
    result,
    outcome,
    payoutAmount,
    payoutTxn,
    amountBet,
    network,
    onPlayAgain,
}: ResultScreenProps) {
    const isWin = outcome === 'win';

    return (
        <div
            className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto text-center py-6 px-4 rounded-2xl transition-all duration-500"
            style={
                isWin
                    ? { background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)' }
                    : { background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }
            }
        >
            {/* Icon */}
            <div
                className={isWin ? 'win-icon text-5xl' : 'text-5xl'}
                style={{ lineHeight: 1 }}
            >
                {isWin ? '🎉' : '💀'}
            </div>

            {/* Headline */}
            <div>
                <h2
                    className="text-3xl font-semibold italic mb-1"
                    style={{
                        fontFamily: 'var(--font-serif)',
                        color: isWin ? '#16A34A' : '#DC2626',
                    }}
                >
                    {isWin ? 'You won!' : 'You lost.'}
                </h2>
                <p className="text-sm font-mono text-black font-bold">
                    Coin landed on{' '}
                    <span className="font-semibold" style={{ color: isWin ? '#16A34A' : '#DC2626' }}>
                        {result}
                    </span>
                </p>
            </div>

            {/* Payout / Loss */}
            {isWin && payoutAmount ? (
                <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-black mb-2 font-bold">Payout sent</p>
                    <p
                        className="text-4xl font-mono font-bold tabular-nums flex items-center justify-center gap-2"
                        style={{ color: '#16A34A' }}
                    >
                        <SolanaLogo className="w-8 h-8" />
                        {payoutAmount.toFixed(4)}
                    </p>
                    {payoutTxn && (
                        <div className="mt-2">
                            <SolscanLink txn={payoutTxn} network={network} />
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-black mb-2 font-bold">You lost</p>
                    <p
                        className="text-4xl font-mono font-bold tabular-nums flex items-center justify-center gap-2"
                        style={{ color: '#DC2626' }}
                    >
                        <SolanaLogo className="w-8 h-8 opacity-60" />
                        {amountBet}
                    </p>
                </div>
            )}

            {/* Separator */}
            <div className="w-full h-px" style={{ background: 'rgba(0,0,0,0.08)' }} />

            {/* Play again */}
            <button
                onClick={onPlayAgain}
                className="w-full py-3 rounded-xl font-mono font-semibold text-sm tracking-wider uppercase transition-all duration-200"
                style={{ background: '#1A1A1A', color: '#FAFAF9' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.background = '#333')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.background = '#1A1A1A')}
            >
                {isWin ? 'Play again ↺' : 'Try again ↺'}
            </button>

            <p className="text-xs text-black font-mono font-bold opacity-80">
                Provably fair · Mainnet
            </p>
        </div>
    );
}
