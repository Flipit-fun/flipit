'use client';

interface ActionButtonsProps {
    onHit: () => void;
    onStand: () => void;
    disabled: boolean;
}

export default function ActionButtons({ onHit, onStand, disabled }: ActionButtonsProps) {
    return (
        <div className="flex gap-4 mt-8">
            <button
                onClick={onHit}
                disabled={disabled}
                className="px-8 py-3 rounded-xl border-2 border-white text-white font-mono font-bold uppercase tracking-wider transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Hit
            </button>
            <button
                onClick={onStand}
                disabled={disabled}
                className="px-8 py-3 rounded-xl border-2 border-white text-white font-mono font-bold uppercase tracking-wider transition-all hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Stand
            </button>
        </div>
    );
}
