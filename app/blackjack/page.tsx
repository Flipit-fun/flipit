'use client';

import { useState, useEffect } from 'react';
import BlackjackModal from '@/components/BlackjackModal';
import DepositScreen from '@/components/DepositScreen';
import PaymentPoller from '@/components/PaymentPoller';
import BlackjackResultScreen from '@/components/BlackjackResultScreen';
import PlayerHand from '@/components/PlayerHand';
import DealerHand from '@/components/DealerHand';
import HandValue from '@/components/HandValue';
import ActionButtons from '@/components/ActionButtons';
import PoolTicker from '@/components/PoolTicker';

type Step = 'modal' | 'deposit' | 'active' | 'result';

export default function BlackjackPage() {
    const [step, setStep] = useState<Step>('modal');
    
    const [showModal, setShowModal] = useState(false);

    // Game state
    const [gameId, setGameId] = useState('');
    const [amount, setAmount] = useState(0);
    const [depositAddress, setDepositAddress] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    
    // Active hand state
    const [playerHand, setPlayerHand] = useState<any[]>([]);
    const [dealerHand, setDealerHand] = useState<any[]>([]);
    const [dealerVisibleCard, setDealerVisibleCard] = useState<any>(null);
    const [playerValue, setPlayerValue] = useState<number>(0);
    const [dealerValue, setDealerValue] = useState<number>(0);
    const [isStand, setIsStand] = useState(false);
    
    // Result state
    const [outcome, setOutcome] = useState<'blackjack' | 'win' | 'lose' | 'push' | 'bust' | null>(null);
    const [payoutAmount, setPayoutAmount] = useState(0);
    const [payoutTxn, setPayoutTxn] = useState<string | null>(null);
    
    // UI state
    const [loadingAction, setLoadingAction] = useState(false);

    // Initial reconnect check could go here if gameId in localStorage
    // For now, simpler flow.

    const handleCreate = (id: string, amt: number, addr: string, exp: string) => {
        setGameId(id);
        setAmount(amt);
        setDepositAddress(addr);
        setExpiresAt(exp);
        setShowModal(false);
        setStep('deposit');
    };

    const handlePaymentConfirmed = async () => {
        // Payment verified! Call start logic.
        try {
            const res = await fetch('/api/blackjack/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId })
            });
            const data = await res.json();
            
            if (res.ok) {
                setPlayerHand(data.playerHand);
                setDealerVisibleCard(data.dealerVisible);
                
                // Calculate actual value using API responses
                const newPlayerValue = data.playerHand.reduce((acc: any, c: any) => acc + c.numericValue, 0); // Simplified, rely on API instead
                // Actually the API doesn't send playerValue right now in Start, it is easily handled later or we expect it
                
                if (data.isBlackjack) {
                    setIsStand(true);
                    setDealerHand(data.dealerHand || []);
                    setDealerValue(data.dealerHand?.reduce((acc: any, c: any) => acc + c.numericValue, 0) || 0);
                    setOutcome(data.outcome);
                    setPayoutAmount(data.payoutAmount);
                    setPayoutTxn(data.payoutTxn);
                    setTimeout(() => setStep('result'), 1500); // give time to see cards
                    setStep('active');
                } else {
                    setStep('active');
                }
            } else {
                console.error('Failed to start blackjack hand', data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleHit = async () => {
        setLoadingAction(true);
        try {
            const res = await fetch('/api/blackjack/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId })
            });
            const data = await res.json();
            if (res.ok) {
                setPlayerHand(data.playerHand);
                setPlayerValue(data.playerValue);
                if (data.isBust) {
                    setPlayerValue(data.playerValue);
                    setTimeout(() => {
                        setOutcome('bust');
                        setIsStand(true);
                        setStep('result');
                    }, 1000);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleStand = async () => {
        setLoadingAction(true);
        setIsStand(true);
        try {
            const res = await fetch('/api/blackjack/stand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId })
            });
            const data = await res.json();
            if (res.ok) {
                setDealerHand(data.dealerHand);
                setDealerValue(data.dealerValue);
                setOutcome(data.outcome);
                setPayoutAmount(data.payoutAmount);
                setPayoutTxn(data.payoutTxn);
                
                setTimeout(() => setStep('result'), Math.max(1000, (data.dealerHand.length - 2) * 500 + 1000));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAction(false);
        }
    };

    const resetGame = () => {
        setStep('modal');
        setOutcome(null);
        setIsStand(false);
        setPlayerHand([]);
        setDealerHand([]);
        setDealerVisibleCard(null);
        setPlayerValue(0);
        setDealerValue(0);
        setAmount(0);
        setShowModal(false);
    };

    const isDealing = playerHand.length === 0 && step === 'active';

    return (
        <main className="min-h-screen font-geist tracking-tight relative overflow-hidden flex flex-col items-center justify-center p-4 bg-[#1B4332]">
            <div className="absolute top-0 w-full z-10 p-4 shrink-0">
                <PoolTicker network="mainnet" />
            </div>

            <div className="flex flex-col items-center justify-center min-h-screen w-full pt-16 pb-10">
                
                {step === 'modal' && (
                    <div className="flex flex-col items-center max-w-sm text-center transform scale-100 transition-transform hover:scale-105 duration-300">
                        <h1 className="text-6xl font-serif italic text-white mb-2 drop-shadow-md">Blackjack</h1>
                        <p className="text-white/80 font-mono mb-8 font-semibold tracking-wider drop-shadow-sm">Beat the dealer. Hit or stand.</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-zinc-900 text-white font-mono font-bold uppercase tracking-widest px-10 py-5 rounded-xl shadow-2xl hover:bg-black transition-all border-b-4 border-black/50 active:border-b-0 active:translate-y-1"
                        >
                            Deal me in
                        </button>
                    </div>
                )}
                
                {/* Modal */}
                {step === 'modal' && showModal && (
                    <BlackjackModal 
                        onClose={() => setShowModal(false)} 
                        onGameCreated={handleCreate} 
                    />
                )}

                {step === 'deposit' && (
                    <>
                        <DepositScreen 
                            amount={amount} 
                            depositAddress={depositAddress} 
                            expiresAt={expiresAt}
                            gameId={gameId}
                            onPaymentConfirmed={handlePaymentConfirmed}
                        />
                        <PaymentPoller 
                            gameId={gameId} 
                            active={step === 'deposit'}
                            onConfirmed={handlePaymentConfirmed} 
                            onExpired={resetGame}
                            verifyEndpoint="/api/blackjack/verify" 
                        />
                    </>
                )}

                {(step === 'active' || step === 'result') && (
                    <div className="w-full max-w-2xl px-4 flex flex-col justify-between" style={{ minHeight: '60vh' }}>
                        {/* Dealer Area */}
                        <div className="flex flex-col items-center w-full">
                            <span className="text-white/50 font-mono uppercase tracking-widest text-xs mb-2">Dealer</span>
                            <DealerHand 
                                visibleCard={dealerVisibleCard} 
                                fullHand={dealerHand} 
                                isStand={isStand} 
                            />
                            {isStand && dealerValue > 0 && (
                                <HandValue value={dealerValue} label="Dealer" />
                            )}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Player Area */}
                        <div className="flex flex-col items-center w-full mt-12">
                            <span className="text-white/50 font-mono uppercase tracking-widest text-xs mb-2">Player</span>
                            <PlayerHand cards={playerHand} title="Player" />
                            {playerValue > 0 && (
                                <HandValue value={playerValue} label="You" highlight={playerValue === 21} />
                            )}
                            
                            {!isStand && step === 'active' && (
                                <ActionButtons 
                                    onHit={handleHit} 
                                    onStand={handleStand} 
                                    disabled={loadingAction || isStand || isDealing} 
                                />
                            )}
                        </div>
                    </div>
                )}
                
                {step === 'result' && outcome && (
                    <BlackjackResultScreen 
                        outcome={outcome}
                        payoutAmount={payoutAmount}
                        payoutTxn={payoutTxn}
                        network="mainnet"
                        onPlayAgain={resetGame}
                    />
                )}
            </div>
        </main>
    );
}
