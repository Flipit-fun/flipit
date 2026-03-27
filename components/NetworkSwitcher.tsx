'use client';

import React from 'react';

type Network = 'mainnet' | 'devnet';

interface NetworkSwitcherProps {
    network: Network;
    onChange: (network: Network) => void;
}

export default function NetworkSwitcher({ network, onChange }: NetworkSwitcherProps) {
    return (
        <div className="flex items-center p-1 bg-gray-100/50 rounded-full border border-gray-200/50 backdrop-blur-sm self-start">
            <button
                onClick={() => onChange('mainnet')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 ${network === 'mainnet'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${network === 'mainnet' ? 'bg-green-500' : 'bg-gray-300'}`} />
                Mainnet
            </button>
            <button
                onClick={() => onChange('devnet')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider transition-all duration-300 ${network === 'devnet'
                        ? 'bg-white text-yellow-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${network === 'devnet' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`} />
                Demo
            </button>
        </div>
    );
}
