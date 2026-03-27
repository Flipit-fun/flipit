import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SolanaLogo from '@/components/SolanaLogo';

// Force dynamic to ensure we get latest games on every load
export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
    const { data: games, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Error fetching history:', error);
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <main className="min-h-screen bg-[#FAFAF9] text-[#1A1A1A] p-6 sm:p-12 font-sans selection:bg-black selection:text-white">
            <div className="max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/" className="group flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-black transition-all">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back home
                    </Link>
                    <h1
                        className="text-4xl font-semibold italic"
                        style={{ fontFamily: 'var(--font-serif)' }}
                    >
                        History
                    </h1>
                    <div className="w-20" /> {/* Spacer for centering */}
                </div>

                {/* Games Table/List */}
                {(!games || games.length === 0) ? (
                    <div className="text-center py-24 border border-dashed border-gray-200 rounded-3xl">
                        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">No games recorded yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {games.map((game) => (
                            <div
                                key={game.id}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${game.outcome === 'win'
                                            ? 'bg-green-50 text-green-600'
                                            : game.outcome === 'lose'
                                                ? 'bg-red-50 text-red-600'
                                                : 'bg-gray-50 text-gray-400'
                                        }`}>
                                        {game.outcome === 'win' ? '🎉' : game.outcome === 'lose' ? '💀' : '⏳'}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-sm tracking-tight">
                                                {game.choice?.toUpperCase() || '---'}
                                            </span>
                                            <span className="text-[10px] font-mono text-gray-300">
                                                {formatDate(game.created_at)}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-400 truncate max-w-[120px] sm:max-w-none">
                                            {game.payout_wallet.slice(0, 4)}...{game.payout_wallet.slice(-4)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-sm">
                                        <SolanaLogo className="w-3.5 h-3.5 opacity-60" />
                                        <span>{game.amount_sol}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {game.deposit_txn && (
                                            <a
                                                href={`https://solscan.io/tx/${game.deposit_txn}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-mono text-gray-400 hover:text-black hover:underline underline-offset-4"
                                            >
                                                TXN ↗
                                            </a>
                                        )}
                                        <div className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded-md ${game.status === 'complete'
                                                ? 'bg-gray-100 text-gray-600'
                                                : 'bg-yellow-50 text-yellow-600 animate-pulse'
                                            }`}>
                                            {game.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Disclaimer */}
                <div className="mt-12 text-center text-[10px] font-mono text-gray-300 uppercase tracking-[0.2em] opacity-50">
                    Latest 50 games · Real-time data from Supabase
                </div>
            </div>

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-black blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black blur-[120px]" />
            </div>
        </main>
    );
}
