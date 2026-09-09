import React, { useState, useEffect } from 'react';
import { X, Award, Sparkles, RefreshCw, Trophy, CheckCircle2, Volume2, ShieldAlert } from 'lucide-react';
import { WINNERS_LIST } from '../data/mockData';

interface LiveDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveDrawModal: React.FC<LiveDrawModalProps> = ({ isOpen, onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentNumber, setCurrentNumber] = useState('AS-70-145');
  const [winnerFound, setWinnerFound] = useState<any | null>(null);

  if (!isOpen) return null;

  const startDraw = () => {
    setIsSpinning(true);
    setWinnerFound(null);

    let count = 0;
    const interval = setInterval(() => {
      const randomTicket = `AS-70-${Math.floor(100 + Math.random() * 900)}`;
      setCurrentNumber(randomTicket);
      count++;

      if (count > 25) {
        clearInterval(interval);
        setIsSpinning(false);
        setWinnerFound({
          name: 'Ali Raza',
          ticket: 'AS-70-204 (Your Ticket!)',
          prize: 'Brand New HONDA CD 70',
          benefit: 'Agli Tamam Qistain MAAF! (All remaining installments waived)',
          date: '15 Nov 2023'
        });
      }
    }, 90);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-[#181c1c] via-[#2d3131] to-[#181c1c] text-white w-full max-w-md rounded-2xl shadow-2xl border border-[#fed488]/40 overflow-hidden my-auto p-6 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 gold-gradient px-4 py-1 rounded-full text-[#261900] text-xs font-bold font-['Montserrat'] shadow-gold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TRANSPARENT DIGITAL BALLOT</span>
        </div>

        <h3 className="font-['Montserrat'] font-black text-2xl text-white tracking-tight mb-1">
          Monthly Lucky Draw Simulator
        </h3>
        <p className="text-xs text-[#fed488] mb-6">
          Honda CD70 36-Month Committee Scheme • Live Balloting Machine
        </p>

        {/* Rolling Display Box */}
        <div className="bg-black/60 border-2 border-[#fed488] rounded-2xl p-6 mb-6 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 gold-gradient rounded-full opacity-10 blur-2xl pointer-events-none"></div>

          <p className="text-xs text-white/60 font-mono tracking-widest uppercase mb-1">
            BALLOT MACHINE STATUS: {isSpinning ? 'SPINNING...' : winnerFound ? 'WINNER ANNOUNCED!' : 'READY TO DRAW'}
          </p>

          <div className={`font-mono text-3xl sm:text-4xl font-extrabold tracking-wider my-3 ${isSpinning ? 'text-amber-400 animate-pulse' : 'text-[#fed488]'}`}>
            {currentNumber}
          </div>

          <p className="text-[11px] text-white/70">
            Total Valid Pool: <strong>200 Members</strong> • Supervised by Committee Board
          </p>
        </div>

        {winnerFound && (
          <div className="bg-[#be1e2d]/30 border border-[#be1e2d] rounded-2xl p-4 mb-5 text-left space-y-2 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Trophy className="w-5 h-5" />
              <span>OFFICIAL DRAW RESULT:</span>
            </div>
            <p className="text-xs text-white font-semibold">
              Winner Member: <strong className="text-[#fed488] text-sm">{winnerFound.name}</strong>
            </p>
            <p className="text-xs text-white font-semibold">
              Winning Prize: <strong className="text-white">{winnerFound.prize}</strong>
            </p>
            <div className="bg-black/40 p-2 rounded-lg text-[11px] text-[#fed488]">
              🌟 {winnerFound.benefit}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={startDraw}
            disabled={isSpinning}
            className="w-full gold-gradient text-[#261900] font-['Montserrat'] font-black text-sm py-3.5 rounded-full shadow-lg hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'DRAWING TICKET NUMBER...' : winnerFound ? 'RUN DRAW AGAIN' : 'START MONTHLY BALLOT'}</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs text-white/70 hover:text-white underline"
          >
            Close Ballot Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
