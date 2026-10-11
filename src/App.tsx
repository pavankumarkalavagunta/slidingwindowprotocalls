import React, { useState, useEffect } from 'react';
import { 
  SimState, 
  createInitialSimState, 
  advanceStep, 
  submitAck,
  ProtocolMode
} from './utils/simulationEngine';
import { VisualWindowTrack } from './components/VisualWindowTrack';
import { ThreeGoldenRules } from './components/ThreeGoldenRules';
import { ConsoleOutput } from './components/ConsoleOutput';
import { CodeLineInspector } from './components/CodeLineInspector';
import { InteractiveScenarios } from './components/InteractiveScenarios';
import { CompareSRvsGBN } from './components/CompareSRvsGBN';
import { DualBattleRunner } from './components/DualBattleRunner';
import { QuickCheckQuiz } from './components/QuickCheckQuiz';
import { 
  Network, 
  Cpu, 
  BookOpen, 
  Code2, 
  HelpCircle, 
  RotateCcw, 
  Sparkles,
  CheckCircle2,
  Sliders,
  Swords,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

type NavTab = 'simulator' | 'golden_rules' | 'code' | 'battle' | 'quiz';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('simulator');
  const [protocol, setProtocol] = useState<ProtocolMode>('SELECTIVE_REPEAT');
  const [totalFrames, setTotalFrames] = useState<number>(6);
  const [windowSize, setWindowSize] = useState<number>(3);

  const [state, setState] = useState<SimState>(() =>
    createInitialSimState(totalFrames, windowSize, protocol)
  );

  const [autoPlay, setAutoPlay] = useState<boolean>(false);

  // Auto-play stepper
  useEffect(() => {
    let timer: any = null;
    if (autoPlay && !state.isComplete && state.phase !== 'WAITING_ACK') {
      timer = setTimeout(() => {
        handleStep();
      }, 1100);
    } else if (state.phase === 'WAITING_ACK') {
      setAutoPlay(false);
    }
    return () => clearTimeout(timer);
  }, [autoPlay, state]);

  // Completion confetti
  useEffect(() => {
    if (state.isComplete) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [state.isComplete]);

  const handleStep = () => {
    if (state.phase === 'WAITING_ACK' || state.isComplete) return;
    setState((prev: SimState) => advanceStep(prev));
  };

  const handleSubmitAck = (ackNum: number) => {
    setState((prev: SimState) => submitAck(prev, ackNum));
  };

  const handleReset = (
    newTotal = totalFrames, 
    newWindow = windowSize, 
    newProtocol = protocol
  ) => {
    setAutoPlay(false);
    setState(createInitialSimState(newTotal, newWindow, newProtocol));
  };

  const handleSwitchProtocol = (newProto: ProtocolMode) => {
    setProtocol(newProto);
    handleReset(totalFrames, windowSize, newProto);
  };

  const handleLoadPreset = (preset: 'loss_and_catchup' | 'clean' | 'ooo_burst') => {
    setAutoPlay(false);
    setActiveTab('simulator');
    if (preset === 'loss_and_catchup') {
      setTotalFrames(6);
      setWindowSize(3);
      handleReset(6, 3, protocol);
    } else if (preset === 'clean') {
      setTotalFrames(5);
      setWindowSize(3);
      handleReset(5, 3, protocol);
    } else if (preset === 'ooo_burst') {
      setTotalFrames(7);
      setWindowSize(4);
      handleReset(7, 4, protocol);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <Network className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                  Selective Repeat Protocol Simulator
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  Sliding Window C Algorithms Visualizer &bull; Selective Repeat &amp; Go-Back-N
                </p>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeTab === 'simulator'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>Simulator</span>
              </button>

              <button
                onClick={() => setActiveTab('battle')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeTab === 'battle'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Swords className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">SR vs GBN Battle</span>
                <span className="sm:hidden">Battle</span>
              </button>

              <button
                onClick={() => setActiveTab('golden_rules')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeTab === 'golden_rules'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>The 3 Rules</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeTab === 'code'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span className="hidden sm:inline">C Code Analysis</span>
                <span className="sm:hidden">Code</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition ${
                  activeTab === 'quiz'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Quiz</span>
              </button>
            </nav>

            {/* Reset */}
            <button
              onClick={() => handleReset()}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition border border-slate-700"
              title="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TAB 1: VISUAL SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            {/* Protocol Switcher Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-md">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">
                  Select Protocol:
                </span>
                <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                  <button
                    onClick={() => handleSwitchProtocol('SELECTIVE_REPEAT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      protocol === 'SELECTIVE_REPEAT'
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>⚡ Selective Repeat (SR)</span>
                  </button>
                  <button
                    onClick={() => handleSwitchProtocol('GO_BACK_N')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      protocol === 'GO_BACK_N'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🔁 Go-Back-N (GBN)</span>
                  </button>
                </div>
              </div>

              {/* Simulation Parameters */}
              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="flex items-center space-x-1.5">
                  <label htmlFor="total-frames" className="text-slate-400">Total Frames:</label>
                  <select
                    id="total-frames"
                    value={totalFrames}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTotalFrames(val);
                      handleReset(val, windowSize, protocol);
                    }}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 focus:outline-none"
                  >
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <label htmlFor="window-size" className="text-slate-400">Window Size (N):</label>
                  <select
                    id="window-size"
                    value={windowSize}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setWindowSize(val);
                      handleReset(totalFrames, val, protocol);
                    }}
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-cyan-300 focus:outline-none"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 1-Click Guided Scenario Bar */}
            <InteractiveScenarios onLoadPreset={handleLoadPreset} />

            {/* Current Step Big Friendly Explainer Banner */}
            <div className={`border rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden ${
              protocol === 'SELECTIVE_REPEAT'
                ? 'bg-slate-900 border-cyan-500/40'
                : 'bg-slate-900 border-indigo-500/40'
            }`}>
              <div className="flex items-start space-x-3.5">
                <div className={`w-3 h-3 rounded-full mt-1 animate-ping shrink-0 ${
                  protocol === 'SELECTIVE_REPEAT' ? 'bg-cyan-400' : 'bg-indigo-400'
                }`} />
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {state.explanation.title}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                      {protocol === 'SELECTIVE_REPEAT' ? 'selective_repeat.c' : 'goback_n.c'} &bull; Line {state.activeLine}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {state.explanation.detail}
                  </p>

                  <div className="text-xs text-amber-300/90 pt-1 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{state.explanation.ruleInsight}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Sliding Window Track */}
            <VisualWindowTrack
              state={state}
              onQuickAck={handleSubmitAck}
            />

            {/* Split Screen: Terminal Output (Left) & Code Inspector (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 flex flex-col">
                <ConsoleOutput
                  state={state}
                  onStep={handleStep}
                  onSubmitAck={handleSubmitAck}
                  onReset={() => handleReset()}
                  autoPlay={autoPlay}
                  onToggleAutoPlay={() => setAutoPlay(!autoPlay)}
                />
              </div>

              <div className="lg:col-span-6 flex flex-col">
                <CodeLineInspector state={state} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SIDE-BY-SIDE BATTLE RUNNER */}
        {activeTab === 'battle' && (
          <div className="space-y-6">
            <DualBattleRunner />
            <CompareSRvsGBN />
          </div>
        )}

        {/* TAB 3: THE 3 GOLDEN RULES */}
        {activeTab === 'golden_rules' && <ThreeGoldenRules />}

        {/* TAB 4: CODE LINE-BY-LINE */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  Active Algorithm: {protocol === 'SELECTIVE_REPEAT' ? 'Selective Repeat (selective_repeat.c)' : 'Go-Back-N (goback_n.c)'}
                </h2>
                <p className="text-xs text-slate-400">
                  Click any line of code to see what it does in plain English and why it matters in networking.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSwitchProtocol('SELECTIVE_REPEAT')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    protocol === 'SELECTIVE_REPEAT'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  View SR Code
                </button>
                <button
                  onClick={() => handleSwitchProtocol('GO_BACK_N')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    protocol === 'GO_BACK_N'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  View GBN Code
                </button>
              </div>
            </div>
            <CodeLineInspector state={state} />
          </div>
        )}

        {/* TAB 5: QUIZ */}
        {activeTab === 'quiz' && <QuickCheckQuiz />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sliding Window Protocols Simulator &bull; Selective Repeat &amp; Go-Back-N</span>
          <span className="text-slate-600">Computer Networks &bull; Transport &amp; Data Link Layer</span>
        </div>
      </footer>
    </div>
  );
}
