'use client';

import PoolTicker from '@/components/PoolTicker';
import SocialButtons from '@/components/SocialButtons';
import Link from 'next/link';

export default function Home() {
    const network = 'mainnet';

    return (
        <main className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden dynamic-bg">
            {/* Top Bar */}
            <div className="w-full max-w-5xl flex items-center justify-between z-10">
                <div className="flex flex-col">
                    <h1
                        className="text-4xl sm:text-5xl font-semibold tracking-tighter text-[#1A1A1A]"
                        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
                    >
                        FlipIt Casino
                    </h1>
                </div>
                <div className="flex flex-col items-end">
                    <PoolTicker network={network} />
                </div>
            </div>

            {/* Main Content Area: Two-game selector */}
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center w-full max-w-4xl z-10 py-12 gap-8">
                
                {/* Coin Flip Card */}
                <div className="w-full max-w-sm p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl flex flex-col bg-opacity-90 transition-transform hover:-translate-y-2">
                    <div className="text-6xl mb-4 text-center">🪙</div>
                    <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2 text-center" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Coin Flip</h2>
                    <p className="text-gray-500 text-sm font-mono text-center mb-8 flex-grow">
                        Flip heads or tails.<br/>Double or nothing.
                    </p>
                    <Link href="/flip" className="w-full">
                        <button className="w-full py-4 rounded-xl font-mono font-bold text-sm tracking-wider uppercase transition-all duration-200" style={{ background: '#1A1A1A', color: '#FAFAF9' }}>
                            Flip It →
                        </button>
                    </Link>
                </div>

                {/* Hi-Lo Card */}
                <div className="w-full max-w-sm p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl flex flex-col bg-opacity-90 transition-transform hover:-translate-y-2">
                    <div className="text-6xl mb-4 text-center">🃏</div>
                    <h2 className="text-2xl font-semibold text-[#1A1A1A] mb-2 text-center" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Hi-Lo</h2>
                    <p className="text-gray-500 text-sm font-mono text-center mb-8 flex-grow">
                        Guess above or below 7.<br/>Double down.
                    </p>
                    <Link href="/hilo" className="w-full">
                        <button className="w-full py-4 rounded-xl font-mono font-bold text-sm tracking-wider uppercase transition-all duration-200" style={{ background: '#1A1A1A', color: '#FAFAF9' }}>
                            Deal Me In →
                        </button>
                    </Link>
                </div>

            </div>

            {/* Footer */}
            <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-6 z-10 pt-12">
                <div className="flex items-center gap-8">
                    <Link
                        href="/history"
                        className="text-xs font-mono uppercase tracking-widest text-black hover:text-black transition-colors border-b border-transparent hover:border-black/20 pb-1"
                    >
                        Global History
                    </Link>
                    <SocialButtons />
                </div>
                <div className="text-[10px] font-mono text-black uppercase tracking-[0.2em] text-center sm:text-right">
                    © 2026 Flip Solana · Provably Fair
                </div>
            </div>
        </main>
    );
}
