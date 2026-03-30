'use client';

import { Card } from '@/lib/deck';
import CardFace from './CardFace';

interface DealerHandProps {
    visibleCard: Card | null;
    fullHand: Card[];    // Populated only after STAND or BLACKJACK
    isStand: boolean;
}

export default function DealerHand({ visibleCard, fullHand, isStand }: DealerHandProps) {
    const cards = isStand && fullHand.length > 0 ? fullHand : (visibleCard ? [visibleCard] : []);
    
    // If not stand, show the visible card + 1 fake face-down card
    const displayCards = isStand ? cards : [...cards, { faceDown: true }];

    return (
        <div className="flex flex-col items-center">
            {/* Cards container */}
            <div className="relative flex justify-center mt-2 group" style={{ minHeight: '168px', minWidth: `${120 + (displayCards.length - 1) * 40}px` }}>
                {displayCards.map((card: any, idx) => {
                    return (
                        <div
                            key={idx}
                            className="absolute transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
                            style={{
                                zIndex: idx,
                                left: `${idx * 40}px`, // Staggered overlapping
                                animation: `slideDown 0.5s ${idx * 0.3}s cubic-bezier(0.175, 0.885, 0.32, 1.275) both`
                            }}
                        >
                            {card.faceDown ? (
                                <CardFace faceDown={true} />
                            ) : (
                                <CardFace value={card.value} suit={card.suit as any} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
