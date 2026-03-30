'use client';

export default function HandValue({ value, label, highlight = false }: { value: string | number, label: string, highlight?: boolean }) {
    return (
        <div className={`mt-4 px-4 py-1.5 rounded-full inline-block font-mono text-sm shadow-sm ${highlight ? 'bg-yellow-400 text-black font-bold' : 'bg-white/10 text-white border border-white/20'}`}>
            {label}: {value}
        </div>
    );
}
