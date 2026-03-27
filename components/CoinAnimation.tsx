'use client';

import { useRef, forwardRef, useImperativeHandle } from 'react';

export type CoinSide = 'heads' | 'tails';

export interface CoinAnimationHandle {
    spin: (result: CoinSide) => void;
}

interface CoinAnimationProps {
    onComplete?: (result: CoinSide) => void;
}

const CoinAnimation = forwardRef<CoinAnimationHandle, CoinAnimationProps>(
    ({ onComplete }, ref) => {
        const coinRef = useRef<HTMLDivElement>(null);
        const resultRef = useRef<CoinSide | null>(null);

        useImperativeHandle(ref, () => ({
            spin(result: CoinSide) {
                resultRef.current = result;
                const coin = coinRef.current;
                if (!coin) return;

                // Remove old class to reset, then add back
                coin.classList.remove('spinning');
                void coin.offsetWidth; // reflow
                coin.classList.add('spinning');

                // After animation ends, call onComplete
                setTimeout(() => {
                    onComplete?.(result);
                }, 1550);
            },
        }));

        return (
            <div className="flex flex-col items-center gap-6">
                <div className="coin-container">
                    <div className="coin" ref={coinRef}>
                        {/* Heads face */}
                        <div className="coin-face coin-heads">
                            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.1rem', color: '#7A5C0A' }}>
                                Heads
                            </span>
                        </div>
                        {/* Tails face */}
                        <div className="coin-face coin-tails">
                            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.1rem', color: '#7A5C0A' }}>
                                Tails
                            </span>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-gray-400 font-mono animate-pulse">
                    Flipping…
                </p>
            </div>
        );
    }
);

CoinAnimation.displayName = 'CoinAnimation';
export default CoinAnimation;
