import React from 'react';
import { SimState, getFrameStatus } from '../utils/simulationEngine';
import { FrameStatus } from '../types/protocol';
import { Check, ShieldAlert, ArrowDown, Sparkles, CornerDownRight, RotateCcw } from 'lucide-react';

interface VisualWindowTrackProps {
  state: SimState;
  onQuickAck: (frameNum: number) => void;
}

export const VisualWindowTrack: React.FC<VisualWindowTrackProps> = ({ state, onQuickAck }) => {
  const { totalFrames, windowSize, start, ack, phase, isComplete, protocol, retransmittedCount } = state;
  const isSR = protocol === 'SELECTIVE_REPEAT';
  const windowEnd = Math.min(start + windowSize - 1, totalFrames);

  const allFrames = Array.from({ length: totalFrames }, (_, i) => i + 1);

  // Status style helper
  const getStatusBadge = (status: FrameStatus) => {
    switch (status) {
      case 'ACKED_SLID_PAST':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300',
          badgeText: 'Delivered',
          badgeColor: 'bg-emerald-900/60 text-emerald-300',
          icon: <Check className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'WINDOW_BASE':
        return {
          bg: 'bg-blue-950/70 border-blue-400 text-blue-200 ring-2 ring-blue-500/50 shadow-lg shadow-blue-950/50',
          badgeText: 'Base (start)',
          badgeColor: 'bg-blue-600 text-white font-bold',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-blue-300" />,
        };
      case 'WINDOW_ACKED_OOO':
        return {
          bg: 'bg-purple-950/60 border-purple-400 text-purple-200 ring-1 ring-purple-500/40 shadow-md',
          badgeText: 'Buffered (ACKed)',
          badgeColor: 'bg-purple-900/80 text-purple-300 font-semibold',
          icon: <Check className="w-3.5 h-3.5 text-purple-400" />,
        };
      case 'WINDOW_UNACKED':
        return {
          bg: 'bg-amber-950/50 border-amber-400/80 text-amber-200 ring-1 ring-amber-500/30',
          badgeText: 'In Window (Unacked)',
          badgeColor: 'bg-amber-900/80 text-amber-300',
          icon: null,
        };
      case 'QUEUED':
      default:
        return {
          bg: 'bg-slate-900/70 border-slate-800 text-slate-500',
          badgeText: 'In Queue',
          badgeColor: 'bg-slate-800 text-slate-400',
          icon: null,
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {/* Title & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isSR ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
            }`}>
              {isSR ? 'Selective Repeat Mode' : 'Go-Back-N Mode'}
            </span>
            <span className="text-base sm:text-lg font-bold text-white tracking-tight">
              Physical Window Rail
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Window capacity is <strong className="text-cyan-300 font-mono">N = {windowSize}</strong>. Current span is <strong className="text-cyan-300 font-mono">[{start} .. {windowEnd}]</strong>.
            {!isSR && retransmittedCount > 0 && (
              <span className="ml-2 text-rose-400 font-mono font-semibold">
                (GBN Retransmissions: {retransmittedCount})
              </span>
            )}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/50 text-emerald-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Acknowledged &amp; Slid Past
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500 text-blue-300 flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Window Base (start)
          </span>
          {isSR && (
            <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500 text-purple-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> Buffered Early (SR)
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> In Window
          </span>
        </div>
      </div>

      {/* Frame Strip on Rail */}
      <div className="relative pt-9 pb-3 overflow-x-auto">
        {/* Physical Sliding Window Bracket */}
        {!isComplete && start <= totalFrames && (
          <div 
            className="absolute top-1 left-0 flex items-center space-x-1 transition-all duration-300 pointer-events-none"
            style={{
              transform: `translateX(${Math.max(0, (start - 1) * 88)}px)`,
            }}
          >
            <div className={`h-5 border-l-2 border-t-2 ${isSR ? 'border-cyan-400' : 'border-indigo-400'} w-3`}></div>
            <div className={`text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-950/90 px-2 py-0.5 rounded border shadow ${
              isSR ? 'text-cyan-300 border-cyan-500/40' : 'text-indigo-300 border-indigo-500/40'
            }`}>
              {isSR ? 'SR Window' : 'GBN Window'} [N={windowSize}]
            </div>
            <div 
              className={`h-5 border-r-2 border-t-2 ${isSR ? 'border-cyan-400' : 'border-indigo-400'}`}
              style={{ width: `${Math.max(20, (windowEnd - start) * 88 + 30)}px` }}
            ></div>
          </div>
        )}

        {/* Frames Track */}
        <div className="flex items-center space-x-3 min-w-max py-2">
          {allFrames.map((frameNum) => {
            const status = getFrameStatus(frameNum, start, windowSize, totalFrames, ack, protocol);
            const style = getStatusBadge(status);
            const isInWindow = frameNum >= start && frameNum <= windowEnd;
            const isUnacked = ack[frameNum] === 0;
            const canClickToAck = isInWindow && phase === 'WAITING_ACK';

            return (
              <div key={frameNum} className="relative flex flex-col items-center">
                {/* Pointer for 'start' */}
                {frameNum === start && !isComplete && (
                  <div className="absolute -top-7 flex flex-col items-center animate-bounce">
                    <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-500 shadow">
                      start = {start}
                    </span>
                    <ArrowDown className="w-3 h-3 text-blue-400" />
                  </div>
                )}

                {/* Frame Tile */}
                <button
                  type="button"
                  disabled={!canClickToAck}
                  onClick={() => onQuickAck(frameNum)}
                  className={`w-18 h-22 rounded-xl border flex flex-col justify-between p-2 transition-all relative ${style.bg} ${
                    canClickToAck
                      ? 'cursor-pointer hover:scale-105 hover:border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-900/40'
                      : 'cursor-default'
                  }`}
                  title={
                    canClickToAck 
                      ? isSR
                        ? `Click to send individual ACK for Frame ${frameNum}`
                        : `Click to send cumulative ACK UP TO Frame ${frameNum}`
                      : style.badgeText
                  }
                >
                  {/* Array Index & Status */}
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono text-slate-400">
                      ack[{frameNum}]
                    </span>
                    <span className="text-xs font-mono font-bold">
                      {ack[frameNum]}
                    </span>
                  </div>

                  {/* Frame ID */}
                  <div className="flex items-center justify-center space-x-1 my-1">
                    <span className="text-lg font-extrabold font-mono tracking-tight">
                      F{frameNum}
                    </span>
                    {style.icon}
                  </div>

                  {/* Bottom State Pill */}
                  <div className={`text-[9px] font-mono text-center rounded px-1 py-0.5 ${style.badgeColor}`}>
                    {status === 'WINDOW_BASE' ? 'BASE' : status === 'WINDOW_ACKED_OOO' ? 'BUFFERED' : status === 'ACKED_SLID_PAST' ? 'ACKED' : isInWindow ? 'UNACKED' : 'QUEUE'}
                  </div>
                </button>

                {/* Subtitle */}
                <span className="text-[10px] font-mono text-slate-500 mt-1">
                  Frame #{frameNum}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Protocol Explanation Callout */}
      <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start space-x-3">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          {isSR ? (
            <>
              <strong className="text-slate-100">Selective Repeat Mechanism:</strong>
              <p className="text-slate-400 mt-0.5">
                Each frame is acknowledged individually. If frame {start + 1} is acknowledged before frame {start}, it is saved in memory (buffered). The window advances as soon as base frame <span className="text-blue-300 font-mono font-semibold">start = {start}</span> is acknowledged!
              </p>
            </>
          ) : (
            <>
              <strong className="text-slate-100">Go-Back-N Mechanism:</strong>
              <p className="text-slate-400 mt-0.5">
                Acknowledgments are <strong>cumulative</strong>! Clicking Frame {start + 1} acknowledges both Frame {start} AND Frame {start + 1}. However, if any frame/ACK is lost (input 0), Go-Back-N must restart all the way from <span className="text-blue-300 font-mono font-semibold">start = {start}</span> and retransmit <strong>all {windowSize} frames</strong> in the window!
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
