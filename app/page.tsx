'use client';

import { useState, useRef, useCallback } from 'react';
import PoolTicker from '@/components/PoolTicker';
import NetworkSwitcher from '@/components/NetworkSwitcher';
import FlipButton from '@/components/FlipButton';
import FlipModal from '@/components/FlipModal';
import DepositScreen from '@/components/DepositScreen';
import PaymentPoller from '@/components/PaymentPoller';
import CoinAnimation, { CoinAnimationHandle, CoinSide } from '@/components/CoinAnimation';
import ResultScreen from '@/components/ResultScreen';
import SocialButtons from '@/components/SocialButtons';
import Link from 'next/link';

type Outcome = 'win' | 'lose';
type GameState = 'idle' | 'deposit' | 'confirmed' | 'flipping' | 'result';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [gameAmount, setGameAmount] = useState<number>(0);
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [gameResult, setGameResult] = useState<{ result: CoinSide, outcome: Outcome, payoutAmount?: number, payoutTxn?: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState<'mainnet' | 'devnet'>('devnet');

  const coinRef = useRef<CoinAnimationHandle>(null);

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

  const handleFlipNow = async () => {
    if (!currentGameId) return;
    setError('');
    setLoading(true);
    setGameState('flipping');

    try {
      const res = await fetch('/api/game/flip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: currentGameId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Flip failed. Try again.');
        setGameState('confirmed');
        setLoading(false);
        return;
      }

      // Trigger animation
      coinRef.current?.spin(data.result as CoinSide);

      // wait for animation to finish
      setTimeout(() => {
        setGameResult({
          result: data.result,
          outcome: data.outcome,
          payoutAmount: data.payoutAmount,
          payoutTxn: data.payoutTxn
        });
        setGameState('result');
        setLoading(false);
      }, 1800);

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
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden dynamic-bg">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10">
        <div className="flex flex-col">
          <h1
            className="text-4xl sm:text-5xl font-semibold tracking-tighter text-[#1A1A1A]"
            style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            Flip
          </h1>
          <NetworkSwitcher network={network} onChange={setNetwork} />
        </div>
        <div className="flex flex-col items-end">
          <PoolTicker network={network} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md z-10 py-12">
        {gameState === 'idle' && (
          <div className="flex animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <FlipButton onClick={handlePlay} />
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
            <PaymentPoller
              gameId={currentGameId!}
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
                onClick={handleFlipNow}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-mono font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #DAA520)',
                  color: '#7A5C0A',
                }}
              >
                {loading ? 'PREPARING...' : '🪙 FLIP NOW'}
              </button>
            </div>
          </div>
        )}

        {gameState === 'flipping' && (
          <div className="flex flex-col items-center gap-12">
            <CoinAnimation
              ref={coinRef}
            />
            <div className="text-center space-y-2 animate-pulse">
              <h2 className="text-xl font-mono font-bold uppercase tracking-widest text-[#1A1A1A]">
                Checking Oracle...
              </h2>
              <p className="text-sm font-mono text-gray-400">
                Don't blink.
              </p>
            </div>
          </div>
        )}

        {gameState === 'result' && gameResult && (
          <div className="w-full animate-in zoom-in-95 duration-500">
            <ResultScreen
              result={gameResult.result}
              outcome={gameResult.outcome}
              payoutAmount={gameResult.payoutAmount}
              payoutTxn={gameResult.payoutTxn}
              amountBet={gameAmount}
              network={network}
              onPlayAgain={resetGame}
            />
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
        <FlipModal
          onClose={() => setShowModal(false)}
          onGameCreated={handleGameCreated}
          network={network}
        />
      )}
    </main>
  );
}
