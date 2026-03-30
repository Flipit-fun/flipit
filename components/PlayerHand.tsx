'use client';

import { Card } from '@/lib/deck';
import CardFace from './CardFace';

interface PlayerHandProps {
    cards: Card[];
    title: string;
}

export default function PlayerHand({ cards, title }: PlayerHandProps) {
    return (
        <div className="flex flex-col items-center">
            {/* Cards container */}
            <div className="relative flex justify-center mt-2 group" style={{ minHeight: '168px', minWidth: `${120 + (cards.length - 1) * 40}px` }}>
                {cards.map((card, idx) => {
                    return (
                        <div
                            key={idx}
                            className="absolute transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                            style={{
                                zIndex: idx,
                                left: `${idx * 40}px`, // Staggered overlapping
                                animation: `slideUp 0.5s ${idx * 0.3}s cubic-bezier(0.175, 0.885, 0.32, 1.275) both`
                            }}
                        >
                            <CardFace value={card.value} suit={card.suit as any} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
