'use client';

import { useState } from 'react';
import PoolTicker from '@/components/PoolTicker';
import HiLoModal from '@/components/HiLoModal';
import DepositScreen from '@/components/DepositScreen';
import PaymentPoller from '@/components/PaymentPoller';
import CardAnimation from '@/components/CardAnimation';
import HiLoResultScreen from '@/components/HiLoResultScreen';
import SocialButtons from '@/components/SocialButtons';
import Link from 'next/link';
import { CardFaceProps } from '@/components/CardFace';

type Outcome = 'win' | 'lose' | 'bust';
type GameState = 'idle' | 'deposit' | 'confirmed' | 'dealing' | 'result';

export default function HiLo() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [gameAmount, setGameAmount] = useState<number>(0);
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [gameResult, setGameResult] = useState<{ 
      cardValue: CardFaceProps['value'], 
      cardSuit: CardFaceProps['suit'], 
      outcome: Outcome, 
      payoutAmount?: number, 
      payoutTxn?: string 
  } | null>(null);
  
  // To trigger flip
  const [isFlipped, setIsFlipped] = useState(false);
  const [drawnValue, setDrawnValue] = useState<CardFaceProps['value']>();
  const [drawnSuit, setDrawnSuit] = useState<CardFaceProps['suit']>();

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const network = 'mainnet';

  const handlePlay = () => {
    setShowModal(true);
  };

  const handleGameCreated = (gameId: string, amount: number, depAddr: string, expiry: string) => {
    setCurrentGameId(gameId);
    setGameAmount(amount);
    setDepositAddress(depAddr);
    setExpiresAt(expiry);
    setGameState('deposit');
    setShowModal(false);
  };

  const handlePaymentConfirmed = () => {
    setGameState('confirmed');
  };

  const handleDealNow = async () => {
    if (!currentGameId) return;
    setError('');
    setLoading(true);
    setGameState('dealing');
    setIsFlipped(false); // Make sure it starts face down

    try {
      const res = await fetch('/api/hilo/deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: currentGameId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Deal failed. Try again.');
        setGameState('confirmed');
        setLoading(false);
        return;
      }

      // We have the card data
      const card = data.card;
      setDrawnValue(card.value);
      setDrawnSuit(card.suit);

      // Trigger animation frame flip
      requestAnimationFrame(() => {
          setIsFlipped(true);
      });

      // wait for flip animation (0.8s) + a little delay to read it, then show result screen (total ~1.5s)
      setTimeout(() => {
        setGameResult({
          cardValue: card.value,
          cardSuit: card.suit,
          outcome: data.outcome,
          payoutAmount: data.payoutAmount,
          payoutTxn: data.payoutTxn
        });
        setGameState('result');
        setLoading(false);
      }, 1500);

    } catch {
      setError('Network error. Check your connection.');
      setGameState('confirmed');
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setCurrentGameId(null);
    setGameResult(null);
    setError('');
    setIsFlipped(false);
    setDrawnValue(undefined);
    setDrawnSuit(undefined);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden dynamic-bg">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10">
        <Link href="/" className="flex flex-col hover:opacity-80 transition-opacity">
          <h1
            className="text-4xl sm:text-5xl font-semibold tracking-tighter text-[#1A1A1A]"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            Hi-Lo
          </h1>
          <span className="text-xs font-mono tracking-widest text-[#1A1A1A]">← BACK TO GAMES</span>
        </Link>
        <div className="flex flex-col items-end">
          <PoolTicker network={network} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10 py-12">
        {gameState === 'idle' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-1000 gap-8">
            {/* Show a static face-down card as the hero */}
            <CardAnimation isFlipped={false} />
            <button
                onClick={handlePlay}
                className="w-full py-4 rounded-xl font-mono font-bold text-sm tracking-wider uppercase transition-all duration-200 px-12"
                style={{ background: '#1A1A1A', color: '#FAFAF9' }}
            >
                Deal Me In →
            </button>
          </div>
        )}

        {gameState === 'deposit' && (
          <div className="w-full animate-in zoom-in-95 duration-500">
            <DepositScreen
              gameId={currentGameId!}
              depositAddress={depositAddress}
              amount={gameAmount}
              expiresAt={expiresAt}
              onPaymentConfirmed={handlePaymentConfirmed}
            />
            {/* USE HILO endpoints  */}
            <PaymentPoller
              gameId={currentGameId!}
              verifyEndpoint="/api/hilo/verify"
              onConfirmed={handlePaymentConfirmed}
              onExpired={resetGame}
              active={true}
            />
          </div>
        )}

        {gameState === 'confirmed' && (
          <div className="w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-xl space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💰</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#1A1A1A]">Payment Received!</h2>
              <p className="text-sm font-mono text-gray-400">
                Your {gameAmount} SOL has landed. Are you ready?
              </p>
              {error && <p className="text-xs text-red-500 font-mono">{error}</p>}
              <button
                onClick={handleDealNow}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-mono font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #1A1A1A, #333333)',
                  color: '#FAFAF9',
                }}
              >
                {loading ? 'SHUFFLING...' : '🃏 DEAL CARD'}
              </button>
            </div>
          </div>
        )}

        {(gameState === 'dealing' || gameState === 'result') && (
          <div className="w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
              <CardAnimation
                  isFlipped={gameState === 'result' ? true : isFlipped}
                  drawnValue={gameState === 'result' ? gameResult?.cardValue : drawnValue}
                  drawnSuit={gameState === 'result' ? gameResult?.cardSuit : drawnSuit}
               />
              
              {gameState === 'dealing' && (
                <div className="text-center space-y-2 animate-pulse mt-6">
                  <h2 className="text-xl font-mono font-bold uppercase tracking-widest text-[#1A1A1A]">
                    Resolving Deck...
                  </h2>
                </div>
              )}

              {gameState === 'result' && gameResult && (
                <HiLoResultScreen
                  cardValue={gameResult.cardValue}
                  cardSuit={gameResult.cardSuit}
                  outcome={gameResult.outcome}
                  payoutAmount={gameResult.payoutAmount}
                  payoutTxn={gameResult.payoutTxn}
                  amountBet={gameAmount}
                  network={network}
                  onPlayAgain={resetGame}
                />
              )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-6 z-10 pt-12">
        <div className="flex items-center gap-8">
          <Link
            href="/history"
            className="text-xs font-mono uppercase tracking-widest text-black hover:text-black transition-colors border-b border-transparent hover:border-black/20 pb-1"
          >
            Global History
          </Link>
          <SocialButtons />
        </div>
        <div className="text-[10px] font-mono text-black uppercase tracking-[0.2em] text-center sm:text-right">
          © 2026 Flip Solana · 5% House Edge
        </div>
      </div>

      {showModal && (
        <HiLoModal
          onClose={() => setShowModal(false)}
          onGameCreated={handleGameCreated}
        />
      )}
    </main>
  );
}
