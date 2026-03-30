import React from 'react';

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Value = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface CardFaceProps {
  value?: Value;
  suit?: Suit;
  faceDown?: boolean;
}

export default function CardFace({ value = 'A', suit = '♠', faceDown = false }: CardFaceProps) {
  const isRed = suit === '♥' || suit === '♦';
  const colorClass = isRed ? 'text-[#DC2626]' : 'text-[#1A1A1A] dark:text-[#FAFAF9]';

  if (faceDown) {
    return (
      <div 
        className="w-[120px] h-[168px] rounded-[10px] shadow-md border-2 border-white relative overflow-hidden"
        style={{
          background: '#1a1a1a',
          backgroundImage: 'linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111), linear-gradient(45deg, #111 25%, transparent 25%, transparent 75%, #111 75%, #111)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}
      />
    );
  }

  return (
    <div className="w-[120px] h-[168px] rounded-[10px] bg-white shadow-md border border-gray-100 flex flex-col justify-between p-2 relative select-none">
      {/* Top Left */}
      <div className={`flex flex-col items-center leading-none ${colorClass}`}>
        <span className="text-xl font-bold font-mono">{value}</span>
        <span className="text-lg">{suit}</span>
      </div>

      {/* Center large suit */}
      <div className={`absolute inset-0 flex items-center justify-center text-6xl opacity-90 ${colorClass}`}>
        {suit}
      </div>

      {/* Bottom Right (Rotated) */}
      <div className={`flex flex-col items-center leading-none rotate-180 self-end ${colorClass}`}>
        <span className="text-xl font-bold font-mono">{value}</span>
        <span className="text-lg">{suit}</span>
      </div>
    </div>
  );
}
