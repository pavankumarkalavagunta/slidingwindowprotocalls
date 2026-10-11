import React, { useState } from 'react';
import { Swords, Flame, Check, X, RotateCcw, ArrowRight, Zap } from 'lucide-react';

export const DualBattleRunner: React.FC = () => {
  const [step, setStep] = useState<number>(0);

  // Scenario: 6 frames, window size 3.
  // Round 1: Send 1, 2, 3. Frame 1 ACKed.
  // Round 2: Window is [2, 3, 4]. Frame 2 is LOST! Frame 3 & 4 arrive.
  // Round 3: Retransmission!

  const steps = [
    {
      title: 'Initial Transmit (Frames 1, 2, 3)',
      desc: 'Both protocols transmit the first window [1, 2, 3]. Frame 1 is received and ACKed.',
      gbn: {
        window: '[1, 2, 3]',
        transmitted: '1, 2, 3',
        status: 'Frame 1 ACKed. start moves to 2.',
        packetsSent: 3,
      },
      sr: {
        window: '[1, 2, 3]',
        transmitted: '1, 2, 3',
        status: 'Frame 1 ACKed. start moves to 2.',
        packetsSent: 3,
      },
    },
    {
      title: 'Packet Loss! Frame 2 is Dropped in Network',
      desc: 'Frames 2, 3, 4 are transmitted. Frame 2 drops into the void! Frames 3 & 4 arrive safely.',
      gbn: {
        window: '[2, 3, 4]',
        transmitted: '2, 3, 4',
        status: 'Frame 2 LOST! Receiver DISCARDS frames 3 & 4 because receiver buffer size is only 1!',
        packetsSent: 6,
      },
      sr: {
        window: '[2, 3, 4]',
        transmitted: '2, 3, 4',
        status: 'Frame 2 LOST! Receiver BUFFERS frames 3 & 4 and returns ACK 3 and ACK 4!',
        packetsSent: 6,
      },
    },
    {
      title: 'The Retransmission Comparison (The Big Difference)',
      desc: 'Sender times out on Frame 2 and initiates retransmission.',
      gbn: {
        window: '[2, 3, 4]',
        transmitted: '2, 3, 4 (ALL 3 RESENT!)',
        status: 'Go-Back-N PENALTY: Retransmits all 3 frames from start=2, even though 3 & 4 were delivered before!',
        packetsSent: 9,
      },
      sr: {
        window: '[2, 3, 4]',
        transmitted: '2 ONLY!',
        status: 'Selective Repeat TRIUMPH: Retransmits ONLY Frame 2! Frames 3 & 4 are already in receiver buffer.',
        packetsSent: 7,
      },
    },
    {
      title: 'Final Slide & Completion',
      desc: 'Frame 2 is acknowledged.',
      gbn: {
        window: '[5, 6]',
        transmitted: '5, 6',
        status: 'Window moves to [5, 6] after resending 2, 3, 4.',
        packetsSent: 11,
      },
      sr: {
        window: '[5, 6]',
        transmitted: '5, 6',
        status: 'When Frame 2 arrives, window INSTANTLY slides past 2, 3, and 4 in one leap to [5, 6]!',
        packetsSent: 9,
      },
    },
  ];

  const current = steps[step];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-1">
            <Swords className="w-4 h-4" />
            <span>Interactive Side-by-Side Simulation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Go-Back-N vs Selective Repeat: The Packet Loss Battle
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Watch what happens in both algorithms when Frame 2 is dropped under identical network conditions:
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setStep(0)}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart Battle</span>
          </button>
          <button
            onClick={() => setStep(prev => Math.min(prev + 1, steps.length - 1))}
            disabled={step === steps.length - 1}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1 ${
              step === steps.length - 1
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
            }`}
          >
            <span>Next Phase</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
        <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">
          Phase {step + 1} of {steps.length}: {current.title}
        </span>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
          {current.desc}
        </p>
      </div>

      {/* Duel Arena Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Go-Back-N Arena */}
        <div className="bg-slate-950 p-5 rounded-xl border border-rose-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold font-mono text-rose-400">
                Go-Back-N (GBN)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                Packets Sent: {current.gbn.packetsSent}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Current Window:</span>
                <span className="font-bold text-slate-200">{current.gbn.window}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Transmitted on Wire:</span>
                <span className="font-bold text-rose-400">{current.gbn.transmitted}</span>
              </div>

              <div className="p-3 rounded bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs leading-relaxed">
                {current.gbn.status}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <strong>Verdict:</strong> Discards valid out-of-order frames, forcing high retransmission overhead.
          </div>
        </div>

        {/* Selective Repeat Arena */}
        <div className="bg-slate-950 p-5 rounded-xl border border-cyan-800/70 ring-1 ring-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold font-mono text-cyan-300">
                Selective Repeat (SR)
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                Packets Sent: {current.sr.packetsSent} (Saved {current.gbn.packetsSent - current.sr.packetsSent} packets!)
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Current Window:</span>
                <span className="font-bold text-slate-200">{current.sr.window}</span>
              </div>

              <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Transmitted on Wire:</span>
                <span className="font-bold text-emerald-400">{current.sr.transmitted}</span>
              </div>

              <div className="p-3 rounded bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 text-xs leading-relaxed">
                {current.sr.status}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-300">
            <strong>Verdict:</strong> Buffers out-of-order packets and retransmits ONLY what was lost. Zero wasted transmissions.
          </div>
        </div>
      </div>
    </div>
  );
};
