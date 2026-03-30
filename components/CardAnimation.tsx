import React from 'react';
import CardFace, { Suit, Value } from './CardFace';

interface CardAnimationProps {
  isFlipped: boolean;
  drawnValue?: Value;
  drawnSuit?: Suit;
}

export default function CardAnimation({ isFlipped, drawnValue, drawnSuit }: CardAnimationProps) {
  return (
    <div className="card-container" style={{ perspective: '1000px' }}>
      <div 
        className={`card-inner relative w-[120px] h-[168px] ${isFlipped ? 'flipped' : ''}`}
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front (which is actually the face-down back of the card initially) */}
        <div 
          className="card-front absolute inset-0 w-full h-full"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <CardFace faceDown />
        </div>

        {/* Back (which is the revealed face of the card, rotated 180deg so it flips to 360deg/0deg) */}
        <div 
          className="card-back absolute inset-0 w-full h-full"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)' 
          }}
        >
          <CardFace value={drawnValue ?? 'A'} suit={drawnSuit ?? '♠'} />
        </div>
      </div>
    </div>
  );
}
