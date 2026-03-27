'use client';

import { useEffect, useRef } from 'react';

interface PaymentPollerProps {
    gameId: string;
    onConfirmed: (txnSignature: string) => void;
    onExpired: () => void;
    active: boolean;
}

export default function PaymentPoller({
    gameId,
    onConfirmed,
    onExpired,
    active,
}: PaymentPollerProps) {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const expiredRef = useRef(false);

    useEffect(() => {
        if (!active || !gameId) return;
        expiredRef.current = false;

        const poll = async () => {
            if (expiredRef.current) return;
            try {
                const res = await fetch('/api/game/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId }),
                });
                const data = await res.json();

                if (data.status === 'confirmed') {
                    clearInterval(intervalRef.current!);
                    onConfirmed(data.txnSignature);
                } else if (data.status === 'expired') {
                    clearInterval(intervalRef.current!);
                    expiredRef.current = true;
                    onExpired();
                }
            } catch {
                // Network error — keep polling
            }
        };

        poll(); // immediate first check
        intervalRef.current = setInterval(poll, 3_000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [gameId, active, onConfirmed, onExpired]);

    return null; // no UI — purely logic
}
