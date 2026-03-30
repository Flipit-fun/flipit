'use client';

import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import SolanaLogo from './SolanaLogo';

interface BlackjackModalProps {
    onClose: () => void;
    onGameCreated: (gameId: string, amount: number, depositAddress: string, expiresAt: string) => void;
}

function isValidSolanaAddress(addr: string): boolean {
    try {
        const pk = new PublicKey(addr);
        return PublicKey.isOnCurve(pk.toBytes());
    } catch {
        return false;
    }
}

export default function BlackjackModal({ onClose, onGameCreated }: BlackjackModalProps) {
    const network = 'mainnet';
    const [amount, setAmount] = useState<number>(0.05);
    const [payoutWallet, setPayoutWallet] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [maxBet, setMaxBet] = useState<number>(1.0); // Default fallback
    const [loadingPool, setLoadingPool] = useState(true);

    // Initial fetch for max bet
    useEffect(() => {
        const fetchMax = async () => {
            try {
                const res = await fetch(`/api/pool/balance?network=${network}`);
                const data = await res.json();
                if (data.maxBetSol) {
                    // Pool limit for BJ needs to be considered since blackjack takes 2.5x pool solvency
                    // If pool has 100, max bet for BJ is 40.
                    // But maxBetSol from API might be poolBalance / 2.
                    // Let's just use what it returns or apply a stricter cap
                    const maxBjBet = Math.max(0.05, Math.floor((data.maxBetSol * 0.8) * 100) / 100);
                    setMaxBet(maxBjBet);
                    if (0.05 > maxBjBet) setAmount(maxBjBet);
                }
            } catch (err) {
                console.error('Failed to fetch pool limit:', err);
            } finally {
                setLoadingPool(false);
            }
        };
        fetchMax();
    }, [network]);

    const handleSubmit = async () => {
        setError('');

        if (amount > maxBet) {
            setError(`House can only cover up to ${maxBet} SOL right now.`);
            return;
        }

        if (!payoutWallet.trim()) {
            setError('Please enter your payout wallet address.');
            return;
        }
        if (!isValidSolanaAddress(payoutWallet.trim())) {
            setError('Invalid Solana wallet address.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/blackjack/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, payoutWallet: payoutWallet.trim(), network }),
            });
            const data = await res.json();

            if (!res.ok) {
                const msgs: Record<string, string> = {
                    pool_insufficient: 'Table is full — try again later.',
                    rate_limited: `Too many requests. Try again in ${data.retryAfter}s.`,
                    active_game_exists: 'You already have an active game.',
                    invalid_payout_wallet: 'Invalid payout wallet address.',
                    invalid_amount: 'Please choose a bet between 0.05 and 2.0 SOL.',
                };
                setError(msgs[data.error] ?? data.error ?? 'Something went wrong. Try again.');
                return;
            }

            onGameCreated(data.gameId, amount, data.depositAddress, data.expiresAt);
        } catch {
            setError('Network error. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const payoutAmount = (amount * 2).toFixed(4); // standard win payout

    return (
        <div
            className="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="modal-panel w-full max-w-md rounded-2xl p-6 shadow-2xl"
                style={{
                    background: '#FAFAF9',
                    border: '1px solid rgba(0,0,0,0.1)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2
                        className="text-2xl font-semibold"
                        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: '#1A1A1A' }}
                    >
                        Deal me in
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-black hover:bg-gray-100 transition-all font-bold"
                    >
                        ✕
                    </button>
                </div>

                {/* Amount selection Slider */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-mono uppercase tracking-widest text-black font-bold">
                            Bet Amount
                        </label>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 font-mono font-bold text-sm bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full shadow-sm">
                                <SolanaLogo className="w-3.5 h-3.5" />
                                <span>{amount.toFixed(2)}</span>
                            </div>
                            <span className="text-[10px] font-mono text-black">
                                Max bet: {maxBet.toFixed(2)} SOL
                            </span>
                        </div>
                    </div>
                    <div className="relative h-10 flex items-center bg-gray-200 rounded-lg overflow-hidden">
                        <input
                            type="range"
                            min="0.05"
                            max={Math.max(0.05, maxBet)}
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(Number(parseFloat(e.target.value).toFixed(2)))}
                            className="w-full h-1.5 bg-transparent appearance-none cursor-pointer accent-[#1A1A1A] hover:accent-black transition-all absolute inset-x-0"
                            style={{
                                background: `linear-gradient(to right, #1A1A1A 0%, #1A1A1A ${Math.min(100, (amount - 0.05) / (maxBet - 0.05) * 100)}%, transparent ${Math.min(100, (amount - 0.05) / (maxBet - 0.05) * 100)}%, transparent 100%)`,
                            }}
                        />
                    </div>
                </div>

                {/* Payout wallet */}
                <div className="mb-5">
                    <label className="block text-xs font-mono uppercase tracking-widest text-black font-bold mb-2">
                        Payout wallet address
                    </label>
                    <input
                        type="text"
                        value={payoutWallet}
                        onChange={(e) => setPayoutWallet(e.target.value)}
                        placeholder="Your Solana address (e.g. 7xKX...)"
                        className="w-full px-4 py-3 rounded-xl text-sm font-mono border outline-none transition-all duration-150 placeholder:text-gray-500"
                        style={{
                            background: 'transparent',
                            borderColor: error && !payoutWallet ? '#DC2626' : '#E5E4E2',
                            color: '#1A1A1A',
                            fontFamily: 'var(--font-geist-mono)',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#1A1A1A')}
                        onBlur={(e) => (e.target.style.borderColor = '#E5E4E2')}
                    />
                    {error && (
                        <p className="mt-2 text-xs text-red-500 font-mono">{error}</p>
                    )}
                </div>

                {/* Payout preview */}
                <div
                    className="mb-5 p-3 rounded-xl flex items-center justify-between text-sm transition-all"
                    style={{ background: 'rgba(22, 163, 74, 0.06)', border: '1px solid rgba(22, 163, 74, 0.15)' }}
                >
                    <span className="text-black font-mono text-xs uppercase tracking-wider font-bold">Est. Payout</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold" style={{ color: '#16A34A' }}>
                        <SolanaLogo className="w-3.5 h-3.5" />
                        <span>{payoutAmount} SOL</span>
                    </div>
                </div>

                {/* Continue */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || loadingPool}
                    className="w-full py-4 rounded-xl font-mono font-bold text-sm tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: '#1A1A1A',
                        color: '#FAFAF9',
                    }}
                >
                    {loading ? 'Creating game...' : 'Continue →'}
                </button>
            </div>
        </div>
    );
}
