import React, { useState, useEffect } from 'react';
import { SR_C_CODE_LINES, GBN_C_CODE_LINES, CLine } from '../utils/cCodeData';
import { SimState } from '../types/protocol';
import { Code2, ArrowRight, Sparkles, Database, Check } from 'lucide-react';

interface CodeLineInspectorProps {
  state: SimState;
  onSelectLine?: (lineNum: number) => void;
}

export const CodeLineInspector: React.FC<CodeLineInspectorProps> = ({
  state,
  onSelectLine,
}) => {
  const isSR = state.protocol === 'SELECTIVE_REPEAT';
  const currentCodeLines = isSR ? SR_C_CODE_LINES : GBN_C_CODE_LINES;
  const fileName = isSR ? 'selective_repeat.c' : 'goback_n.c';

  const [selectedLine, setSelectedLine] = useState<number>(state.activeLine || (isSR ? 18 : 20));

  useEffect(() => {
    setSelectedLine(state.activeLine);
  }, [state.activeLine]);

  const activeLineObj = currentCodeLines.find(l => l.lineNum === selectedLine) || currentCodeLines[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            {fileName}
          </span>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
            ({isSR ? 'Selective Repeat' : 'Go-Back-N'} C Program)
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Executing:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
            Line {state.activeLine}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
        {/* Code list (7 cols) */}
        <div className="lg:col-span-7 font-mono text-xs overflow-y-auto max-h-[500px] p-2 bg-slate-950/70 divide-y divide-slate-900/60">
          {currentCodeLines.map((line) => {
            const isExecuting = line.lineNum === state.activeLine;
            const isInspecting = line.lineNum === selectedLine;

            return (
              <div
                key={line.lineNum}
                onClick={() => {
                  setSelectedLine(line.lineNum);
                  onSelectLine?.(line.lineNum);
                }}
                className={`flex items-center px-2 py-1 cursor-pointer transition-colors ${
                  isExecuting
                    ? 'bg-cyan-500/20 text-cyan-200 border-l-4 border-cyan-400'
                    : isInspecting
                    ? 'bg-slate-800/60 text-white border-l-4 border-slate-500'
                    : 'hover:bg-slate-900/60 text-slate-400'
                }`}
              >
                {/* Pointer arrow */}
                <div className="w-5 text-center shrink-0">
                  {isExecuting ? (
                    <span className="text-cyan-400 font-bold animate-pulse text-sm">▶</span>
                  ) : (
                    <span className="text-slate-700 text-xs">{isInspecting ? '•' : ''}</span>
                  )}
                </div>

                {/* Line number */}
                <span className="w-7 text-right pr-2 text-slate-600 select-none text-[11px]">
                  {line.lineNum}
                </span>

                {/* Line code text */}
                <div className="flex-1 whitespace-pre overflow-x-auto py-0.5">
                  <span className={
                    line.text.trim().startsWith('while') || line.text.trim().startsWith('for') || line.text.trim().startsWith('if') || line.text.trim().startsWith('else')
                      ? 'text-rose-400 font-bold'
                      : line.text.trim().startsWith('int')
                      ? 'text-purple-400'
                      : line.text.includes('printf') || line.text.includes('scanf')
                      ? 'text-cyan-400'
                      : line.text.includes('//') || line.text.includes('/*')
                      ? 'text-slate-500 italic'
                      : 'text-slate-300'
                  }>
                    {line.text || ' '}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plain English Translation & Memory Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 p-5 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Line {activeLineObj.lineNum} in Plain English</span>
            </div>

            {/* Code Box */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
              <code>{activeLineObj.text || '// empty line'}</code>
            </div>

            {/* Plain English Meaning */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1">
                What this line does:
              </div>
              {activeLineObj.plainEnglish || 'Structural statement.'}
            </div>

            {/* Key Rule Highlight if present */}
            {activeLineObj.keyRule && (
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 leading-relaxed">
                <div className="text-[11px] font-mono text-cyan-400 uppercase font-bold mb-1">
                  💡 {isSR ? 'Selective Repeat' : 'Go-Back-N'} Key Rule:
                </div>
                {activeLineObj.keyRule}
              </div>
            )}

            {/* Current Memory Snapshot */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 uppercase font-bold mb-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Variable Watcher</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">start</span>
                  <span className="font-bold text-blue-400">{state.start}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">window</span>
                  <span className="font-bold text-cyan-400">{state.windowSize}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">last ACK</span>
                  <span className="font-bold text-slate-200">{state.receivedAck ?? 'none'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick jump helpers */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <span className="text-[10px] text-slate-500 font-mono block mb-1.5">Jump to key logic lines:</span>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              <button
                onClick={() => setSelectedLine(isSR ? 18 : 20)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Line {isSR ? '18' : '20'}: Loop
              </button>
              <button
                onClick={() => setSelectedLine(isSR ? 24 : 34)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Line {isSR ? '24' : '34'}: Transmit
              </button>
              <button
                onClick={() => setSelectedLine(isSR ? 39 : 44)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Line {isSR ? '39' : '44'}: Loss (0)
              </button>
              <button
                onClick={() => setSelectedLine(isSR ? 57 : 58)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Line {isSR ? '57' : '58'}: Slide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
