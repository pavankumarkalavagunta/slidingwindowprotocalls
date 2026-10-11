import React from 'react';
import { Check, X, ShieldAlert, Cpu } from 'lucide-react';

export const CompareSRvsGBN: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold uppercase mb-1">
          <Cpu className="w-4 h-4" />
          <span>Protocol Comparison</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Selective Repeat (SR) vs Go-Back-N (GBN)
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Why did computer scientists invent Selective Repeat when Go-Back-N already existed?
        </p>
      </div>

      {/* Side-by-side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Go-Back-N */}
        <div className="bg-slate-950 p-5 rounded-xl border border-rose-900/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-rose-400 font-mono">Go-Back-N (GBN)</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              Simpler, but wasteful
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span><strong>Receiver Window = 1:</strong> Receiver has NO buffer for out-of-order packets.</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span><strong>Discards good packets:</strong> If packet 2 is lost, packets 3, 4, 5 are thrown in the trash even if they arrive perfectly!</span>
            </li>
            <li className="flex items-start gap-2">
              <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span><strong>Heavy Retransmission:</strong> Sender must re-send packets 2, 3, 4, 5 all over again.</span>
            </li>
          </ul>
        </div>

        {/* Selective Repeat */}
        <div className="bg-slate-950 p-5 rounded-xl border border-cyan-800/60 ring-1 ring-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-cyan-300 font-mono">Selective Repeat (Our C Program)</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
              Optimal Link Efficiency
            </span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Receiver Window &gt; 1:</strong> Receiver has an internal buffer to store out-of-order frames.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Zero wasted packets:</strong> If packet 2 is lost, packets 3, 4, 5 are kept in memory!</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Retransmits ONLY packet 2:</strong> Sender resends only the single lost frame, saving huge bandwidth!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
