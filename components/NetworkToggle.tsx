'use client';

export default function NetworkToggle() {
    const isDev = process.env.NODE_ENV === 'development';
    const network = process.env.NEXT_PUBLIC_NETWORK ?? 'devnet';
    const isDevnet = network === 'devnet';

    if (!isDevnet && !isDev) return null;

    return (
        <div className="flex items-center gap-2">
            {isDevnet && (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase border"
                    style={{
                        background: 'rgba(234, 179, 8, 0.1)',
                        borderColor: 'rgba(234, 179, 8, 0.35)',
                        color: '#b45309',
                    }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse inline-block" />
                    Devnet
                </span>
            )}
            {!isDevnet && (
                <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase border"
                    style={{
                        background: 'rgba(22, 163, 74, 0.1)',
                        borderColor: 'rgba(22, 163, 74, 0.35)',
                        color: '#15803d',
                    }}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    Mainnet
                </span>
            )}
        </div>
    );
}
