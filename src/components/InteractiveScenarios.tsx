import React from 'react';
import { Sparkles, ArrowRight, Flame, CheckCircle, RotateCw } from 'lucide-react';

interface InteractiveScenariosProps {
  onLoadPreset: (preset: 'loss_and_catchup' | 'clean' | 'ooo_burst') => void;
}

export const InteractiveScenarios: React.FC<InteractiveScenariosProps> = ({ onLoadPreset }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase mb-2">
        <Sparkles className="w-4 h-4" />
        <span>1-Click Learning Scenarios</span>
      </div>
      <h3 className="text-base sm:text-lg font-bold text-white mb-1">
        Experience the Core Concepts in Action
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Click any scenario below to automatically configure the simulator with optimal frames and window size:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Scenario 1: Loss & Double Slide */}
        <button
          onClick={() => onLoadPreset('loss_and_catchup')}
          className="p-4 rounded-xl border border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-950/60 text-left transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase px-2 py-0.5 rounded bg-cyan-900/60">
                ⭐ Highly Recommended
              </span>
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
              Frame Loss &amp; The Double Slide
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Watch Frame 2 get lost, Frame 3 get buffered, and see the window leap forward past both frames once Frame 2 is retransmitted!
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-cyan-900/40 text-[11px] font-mono text-cyan-400 font-semibold flex items-center gap-1">
            <span>Load Scenario</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Scenario 2: Clean In-Order Run */}
        <button
          onClick={() => onLoadPreset('clean')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-850 hover:border-slate-700 text-left transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase px-2 py-0.5 rounded bg-emerald-950/60">
                Ideal Case
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
              Smooth Transmission (No Loss)
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Transmit 5 frames without packet drops to see how the window slides continuously 1 slot at a time.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300 font-semibold flex items-center gap-1">
            <span>Load Scenario</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Scenario 3: Heavy Out-of-Order */}
        <button
          onClick={() => onLoadPreset('ooo_burst')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-850 hover:border-slate-700 text-left transition flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono font-bold text-purple-400 uppercase px-2 py-0.5 rounded bg-purple-950/60">
                Buffer Test
              </span>
              <RotateCw className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-sm font-bold text-white group-hover:text-purple-300 transition">
              Multiple Out-of-Order ACKs
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Window size 4. Acknowledge Frame 3 &amp; 4 first while Frame 1 &amp; 2 are delayed. Watch the receiver buffer fill up.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300 font-semibold flex items-center gap-1">
            <span>Load Scenario</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};
