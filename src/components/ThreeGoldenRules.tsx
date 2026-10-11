import React, { useState } from 'react';
import { 
  Lightbulb, 
  Layers, 
  RotateCw, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const ThreeGoldenRules: React.FC = () => {
  const [activeRule, setActiveRule] = useState<1 | 2 | 3>(2);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-semibold uppercase mb-2">
        <Lightbulb className="w-4 h-4" />
        <span>Algorithm Demystified in 3 Rules</span>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
        How Selective Repeat Actually Works (Without the Confusion)
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
        Every line of the C program exists to enforce one of these three simple rules:
      </p>

      {/* 3 Rule Navigation Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setActiveRule(1)}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeRule === 1
              ? 'bg-cyan-950/80 border-cyan-500 shadow-md ring-1 ring-cyan-500/40 text-cyan-200'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400">Rule 1</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">The Scoreboard Array</div>
          <p className="text-xs text-slate-400 mt-1">
            <code>ack[100] = &#123;0&#125;</code> remembers each packet independently.
          </p>
        </button>

        <button
          onClick={() => setActiveRule(2)}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeRule === 2
              ? 'bg-blue-950/80 border-blue-500 shadow-md ring-1 ring-blue-500/40 text-blue-200'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold uppercase text-blue-400">Rule 2 (Crucial)</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">The "Window Base" Blocker</div>
          <p className="text-xs text-slate-400 mt-1">
            The window ONLY slides when <code>ack[start] == 1</code>.
          </p>
        </button>

        <button
          onClick={() => setActiveRule(3)}
          className={`p-4 rounded-xl border text-left transition-all ${
            activeRule === 3
              ? 'bg-purple-950/80 border-purple-500 shadow-md ring-1 ring-purple-500/40 text-purple-200'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold uppercase text-purple-400">Rule 3</span>
            <RotateCw className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm font-bold text-slate-100">Selective Retransmit</div>
          <p className="text-xs text-slate-400 mt-1">
            When a packet is lost, resend ONLY that single packet.
          </p>
        </button>
      </div>

      {/* Detailed Rule Visualizer */}
      <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
        {activeRule === 1 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold font-mono text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Rule 1: Individual Acknowledgments with ack[i]</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In simpler protocols (like Go-Back-N), the receiver throws away any packet that arrives out of order. In <strong>Selective Repeat</strong>, the receiver has a memory buffer!
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
              <div className="text-cyan-300 font-bold">// C Code in Line 6 &amp; 48:</div>
              <div className="text-slate-300">int ack[100] = &#123;0&#125;; // Start with all zeros</div>
              <div className="text-emerald-400">ack[received_ack] = 1; // Mark this specific frame as received!</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If Frame 1 is lost, but Frame 2 and Frame 3 arrive safely, <code>ack[2] = 1</code> and <code>ack[3] = 1</code>. They are saved in memory! They do <strong>not</strong> need to be retransmitted later.
            </p>
          </div>
        )}

        {activeRule === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-blue-400 font-bold font-mono text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Rule 2: Why the Window Slides (or Doesn't Slide)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              This is the single most important concept to understand in the entire C program!
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
              <div className="text-blue-300 font-bold">// C Code Lines 57-60:</div>
              <div className="text-purple-300">while (start &lt;= total_frames &amp;&amp; ack[start] == 1) &#123;</div>
              <div className="text-emerald-300 pl-4">start++; // Slide window right!</div>
              <div className="text-purple-300">&#125;</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/60 text-xs">
                <span className="font-bold text-rose-300 block mb-1">❌ Case A: Frame start is UNACKED (ack[start] == 0)</span>
                <p className="text-slate-300 leading-relaxed">
                  Even if Frames 2, 3, 4, and 5 are already ACKed, if <code>start = 1</code> and <code>ack[1] == 0</code>, the window is <strong>STUCK</strong> at 1! It cannot slide.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-xs">
                <span className="font-bold text-emerald-300 block mb-1">✅ Case B: Frame start is finally ACKED (ack[start] == 1)</span>
                <p className="text-slate-300 leading-relaxed">
                  As soon as Frame 1 arrives, the <code>while</code> loop increments <code>start</code>. Since 2, 3, 4 were already 1, the window leaps forward multiple steps at once!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeRule === 3 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-purple-400 font-bold font-mono text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Rule 3: Selective Retransmission (Saves Bandwidth)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When a packet drops in transit (simulated by entering <code>0</code> in the C console), only the lost packet is retransmitted.
            </p>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
              <div className="text-purple-300 font-bold">// C Code Line 24:</div>
              <div className="text-slate-300">for (i = start; i &lt; start + window_size &amp;&amp; i &lt;= total_frames; i++) &#123;</div>
              <div className="text-amber-300 pl-4">if (ack[i] == 0) // Only print frames that haven't been ACKed!</div>
              <div className="text-emerald-300 pl-8">printf(&quot;%d &quot;, i);</div>
              <div className="text-slate-300">&#125;</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Go-Back-N would waste network bandwidth retransmitting Frame 1, Frame 2, and Frame 3. Selective Repeat sends <strong>only Frame 1</strong>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
