'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import SolanaLogo from './SolanaLogo';

interface DepositScreenProps {
    gameId: string;
    depositAddress: string;
    amount: number;
    expiresAt: string;
    onPaymentConfirmed: () => void;
}

function useCountdown(expiresAt: string) {
    const [secondsLeft, setSecondsLeft] = useState(() =>
        Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const min = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const sec = String(secondsLeft % 60).padStart(2, '0');
    return { timeString: `${min}:${sec}`, expired: secondsLeft === 0 };
}

function CopyButton({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={copy}
            className="ml-2 px-2 py-0.5 text-xs font-mono rounded-md transition-all duration-150"
            style={{
                background: copied ? 'rgba(22,163,74,0.12)' : 'rgba(0,0,0,0.06)',
                color: copied ? '#16A34A' : '#1A1A1A',
                border: `1px solid ${copied ? 'rgba(22,163,74,0.25)' : 'rgba(0,0,0,0.1)'}`,
            }}
        >
            {copied ? '✓ Copied' : label ?? 'Copy'}
        </button>
    );
}

export default function DepositScreen({
    depositAddress,
    amount,
    expiresAt,
    onPaymentConfirmed,
}: DepositScreenProps) {
    const { timeString, expired } = useCountdown(expiresAt);
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirmed = useCallback(() => {
        setConfirmed(true);
        onPaymentConfirmed();
    }, [onPaymentConfirmed]);

    const pct = Math.max(
        0,
        ((new Date(expiresAt).getTime() - Date.now()) / (15 * 60 * 1000)) * 100
    );

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="text-center">
                <h2
                    className="text-2xl font-semibold italic mb-1"
                    style={{ fontFamily: 'var(--font-serif)' }}
                >
                    Send exactly
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="p-2 bg-gray-100 rounded-xl">
                        <SolanaLogo className="w-6 h-6" />
                    </div>
                    <span
                        className="text-3xl font-mono font-bold"
                        style={{ color: '#1A1A1A', fontFamily: 'var(--font-geist-mono)' }}
                    >
                        {amount}
                    </span>
                    <CopyButton text={String(amount)} label="Copy" />
                </div>
                <p className="text-xs text-black font-mono mt-1 font-bold">SOL to this address</p>
            </div>

            {/* QR Code */}
            <div
                className="p-3 rounded-2xl"
                style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)' }}
            >
                <QRCodeSVG
                    value={`solana:${depositAddress}?amount=${amount}`}
                    size={160}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1A1A1A"
                />
            </div>

            {/* Deposit address */}
            <div className="w-full">
                <label className="block text-xs font-mono uppercase tracking-widest text-black font-bold mb-1">
                    Deposit address
                </label>
                <div
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                    <span
                        className="text-xs font-mono text-black truncate mr-2 font-bold"
                        style={{ fontFamily: 'var(--font-geist-mono)' }}
                    >
                        {depositAddress}
                    </span>
                    <CopyButton text={depositAddress} label="Copy" />
                </div>
            </div>

            {/* Countdown timer */}
            <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-black uppercase tracking-wider font-bold">
                        Expires in
                    </span>
                    <span
                        className="text-sm font-mono font-bold tabular-nums"
                        style={{ color: expired ? '#DC2626' : '#1A1A1A' }}
                    >
                        {expired ? 'Expired' : timeString}
                    </span>
                </div>
                <div
                    className="w-full h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(0,0,0,0.08)' }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                            width: `${pct}%`,
                            background: expired ? '#DC2626' : '#1A1A1A',
                        }}
                    />
                </div>
            </div>

            {/* Waiting state */}
            {!confirmed && !expired && (
                <div className="flex items-center gap-2 text-sm text-black font-mono font-bold">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                    Waiting for payment…
                </div>
            )}

            {confirmed && (
                <div className="flex items-center gap-2 text-sm font-mono font-semibold" style={{ color: '#16A34A' }}>
                    <span>✓</span> Payment confirmed!
                </div>
            )}

            {expired && !confirmed && (
                <p className="text-sm text-red-500 font-mono text-center">
                    Time expired. Please start a new game.
                </p>
            )}
        </div>
    );
}
