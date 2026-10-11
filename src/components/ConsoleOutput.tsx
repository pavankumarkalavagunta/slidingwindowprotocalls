import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Play, Pause, SkipForward, RotateCcw, Flame, CheckCircle } from 'lucide-react';
import { SimState, getUnackedInWindow, getFramesInWindow } from '../utils/simulationEngine';

interface ConsoleOutputProps {
  state: SimState;
  onStep: () => void;
  onSubmitAck: (ackNum: number) => void;
  onReset: () => void;
  autoPlay: boolean;
  onToggleAutoPlay: () => void;
}

export const ConsoleOutput: React.FC<ConsoleOutputProps> = ({
  state,
  onStep,
  onSubmitAck,
  onReset,
  autoPlay,
  onToggleAutoPlay,
}) => {
  const [inputVal, setInputVal] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { start, windowSize, totalFrames, ack, phase, isComplete, protocol } = state;
  const isSR = protocol === 'SELECTIVE_REPEAT';
  const unacked = getUnackedInWindow(start, windowSize, totalFrames, ack);
  const windowFrames = getFramesInWindow(start, windowSize, totalFrames);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.logs]);

  useEffect(() => {
    if (phase === 'WAITING_ACK') {
      inputRef.current?.focus();
    }
  }, [phase]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const num = parseInt(inputVal.trim(), 10);
    if (!isNaN(num)) {
      onSubmitAck(num);
      setInputVal('');
    }
  };

  const actionFrames = isSR ? unacked : windowFrames;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Terminal Title Bar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300 ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>./{isSR ? 'selective_repeat' : 'goback_n'}_sim</span>
          </span>
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center space-x-2">
          {!isComplete && phase !== 'WAITING_ACK' && (
            <button
              onClick={onToggleAutoPlay}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium font-mono transition ${
                autoPlay
                  ? 'bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {autoPlay ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{autoPlay ? 'Pause' : 'Auto-Run'}</span>
            </button>
          )}

          <button
            onClick={onStep}
            disabled={phase === 'WAITING_ACK' || isComplete || autoPlay}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium font-mono transition ${
              phase === 'WAITING_ACK' || isComplete || autoPlay
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
            }`}
          >
            <SkipForward className="w-3 h-3" />
            <span>Next Step &rarr;</span>
          </button>

          <button
            onClick={onReset}
            title="Reset Terminal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 font-mono text-xs sm:text-sm text-slate-200 flex-1 overflow-y-auto space-y-1 min-h-[220px] max-h-[340px]">
        {state.logs.map((log) => {
          if (log.type === 'system') {
            return (
              <div key={log.id} className="text-cyan-400 font-semibold py-0.5">
                {log.text}
              </div>
            );
          }
          if (log.type === 'stdin') {
            return (
              <div key={log.id} className="text-amber-300 font-bold flex items-center space-x-1">
                <span className="text-slate-500">&gt;</span>
                <span>{log.text}</span>
              </div>
            );
          }
          if (log.type === 'slide') {
            return (
              <div key={log.id} className="text-emerald-300 bg-emerald-950/40 border-l-2 border-emerald-400 px-2 py-0.5 my-1">
                {log.text}
              </div>
            );
          }
          if (log.type === 'loss') {
            return (
              <div key={log.id} className="text-rose-400 bg-rose-950/40 border-l-2 border-rose-500 px-2 py-0.5 my-1 font-semibold">
                {log.text}
              </div>
            );
          }
          return (
            <div key={log.id} className="text-slate-300 whitespace-pre-wrap">
              {log.text}
            </div>
          );
        })}

        {phase === 'WAITING_ACK' && (
          <div className="text-amber-400 animate-pulse pt-1">
            &gt; _ (Paused at scanf: {isSR ? 'enter frame ACK or 0 for lost' : 'enter cumulative ACK up to frame or 0 for lost'})
          </div>
        )}

        <div ref={logEndRef} />
      </div>

      {/* Interactive Input Action Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        {phase === 'WAITING_ACK' ? (
          <div className="space-y-2">
            {/* Quick Click Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-mono mr-1">
                {isSR ? 'Quick ACKs:' : 'Cumulative ACKs:'}
              </span>
              {actionFrames.map((f) => (
                <button
                  key={f}
                  onClick={() => onSubmitAck(f)}
                  className="px-2.5 py-1 rounded-md bg-cyan-950 hover:bg-cyan-800 text-cyan-300 border border-cyan-700 font-mono font-bold transition flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                  <span>{isSR ? `ACK F${f}` : `ACK up to F${f}`}</span>
                </button>
              ))}

              <button
                onClick={() => onSubmitAck(0)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 font-mono font-bold transition"
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Simulate Loss (0)</span>
              </button>
            </div>

            {/* Manual input */}
            <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={isSR ? "Type frame number (0 for loss)..." : "Type ACK up to frame (0 for loss)..."}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Submit</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              {isComplete ? 'All frames finished!' : 'Click "Next Step &rarr;" to advance'}
            </span>
            <span>Line {state.activeLine}</span>
          </div>
        )}
      </div>
    </div>
  );
};
