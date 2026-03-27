'use client';

import { useEffect, useState } from 'react';
import SolanaLogo from './SolanaLogo';

interface PoolTickerProps {
    network: 'mainnet' | 'devnet';
}

export default function PoolTicker({ network }: PoolTickerProps) {
    const [pool, setPool] = useState<{ balanceSol: number, network: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [blink, setBlink] = useState(false);

    const fetchBalance = async () => {
        try {
            const res = await fetch(`/api/pool/balance?network=${network}`);
            const data = await res.json();
            if (res.ok && typeof data.balanceSol === 'number') {
                setPool(data);
                setBlink(true);
                setTimeout(() => setBlink(false), 400);
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
        const interval = setInterval(fetchBalance, 5_000); // 5s for real-time feel
        return () => clearInterval(interval);
    }, [network]);

    return (
        <div className="flex items-center justify-center gap-2 py-2 px-4 text-sm">
            <span className="text-black font-mono text-xs tracking-widest uppercase">
                Pool
            </span>
            <div
                className={`flex items-center gap-1.5 font-mono font-semibold transition-all duration-300 text-black ${blink ? 'scale-110' : 'scale-100'
                    }`}
                style={{ fontFamily: 'var(--font-geist-mono)' }}
            >
                {loading ? (
                    <span className="inline-block w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ) : (pool != null && typeof pool.balanceSol === 'number') ? (
                    <>
                        <SolanaLogo className="w-3.5 h-3.5" />
                        <span>{pool.balanceSol.toFixed(3)} SOL</span>
                    </>
                ) : (
                    <span>◎ —</span>
                )}
            </div>
            {pool && (
                <span className="text-black uppercase tracking-wider">
                    live
                </span>
            )}
        </div>
    );
}
