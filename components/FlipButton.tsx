'use client';

interface FlipButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export default function FlipButton({ onClick, disabled }: FlipButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flip-btn-pulse relative group cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Open coin flip modal"
        >
            <div
                className="relative flex items-center justify-center w-48 h-48 rounded-full transition-all duration-200 group-hover:scale-105 group-active:scale-95"
                style={{
                    background: 'radial-gradient(circle at 35% 35%, #F5E663, #D4AF37 45%, #9A7B1C 100%)',
                    boxShadow: '0 0 0 6px #B8941F, 0 12px 40px rgba(212,175,55,0.35), inset 0 2px 8px rgba(255,255,255,0.4)',
                }}
            >
                <div className="flex flex-col items-center gap-1">
                    <span
                        className="text-4xl font-bold italic select-none"
                        style={{ fontFamily: 'var(--font-serif)', color: '#7A5C0A', textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}
                    >
                        Flip
                    </span>
                    <span
                        className="text-xs font-mono uppercase tracking-[0.2em] opacity-70 select-none"
                        style={{ color: '#7A5C0A' }}
                    >
                        it
                    </span>
                </div>
            </div>
        </button>
    );
}
