import React, { useState } from 'react';
import { HelpCircle, Check, X, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizItem {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: 1,
    question: 'In the C code: start = 2, window_size = 3. We receive ACK 4 (ack[4] = 1), but ack[2] is still 0. Does the window slide?',
    options: [
      'Yes, it slides to 5 immediately.',
      'No! The window cannot slide because the base frame (start = 2) is still unacknowledged.',
      'Yes, it slides to 3, skipping frame 2.',
    ],
    correct: 1,
    explanation: 'Correct! Line 57 checks "while (start <= total_frames && ack[start] == 1) start++;". Since ack[2] is 0, the loop condition fails and start stays at 2.',
  },
  {
    id: 2,
    question: 'Why does the display loop check "if (ack[i] == 0)" before printing a frame?',
    options: [
      'To prevent frames that were already received and acknowledged from being displayed or resent.',
      'To verify the frame number is an even number.',
      'To exit the program when frames finish.',
    ],
    correct: 0,
    explanation: 'Correct! In Selective Repeat, out-of-order frames can be acknowledged before the window slides. ack[i] == 0 filters out already-received frames.',
  },
  {
    id: 3,
    question: 'What happens when you enter "0" for the ACK prompt?',
    options: [
      'The program deletes the entire window.',
      'The program records a lost frame, and Selective Repeat will retransmit ONLY that missing frame in the next loop.',
      'The program terminates immediately.',
    ],
    correct: 1,
    explanation: 'Correct! Entering 0 triggers "if (received_ack == 0)". No acknowledgments are erased, and on the next cycle only the unacknowledged frame is transmitted.',
  },
];

export const QuickCheckQuiz: React.FC = () => {
  const [selected, setSelected] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qId: number, optIdx: number) => {
    if (submitted) return;
    setSelected(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleCheck = () => {
    setSubmitted(true);
    const correctCount = QUIZ_ITEMS.filter(q => selected[q.id] === q.correct).length;
    if (correctCount === QUIZ_ITEMS.length) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleReset = () => {
    setSelected({});
    setSubmitted(false);
  };

  const correctCount = QUIZ_ITEMS.filter(q => selected[q.id] === q.correct).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold uppercase mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Comprehension Check</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Did It Click? 3 Quick Test Questions
          </h2>
        </div>

        {submitted && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Score: <strong className="text-white">{correctCount}/{QUIZ_ITEMS.length}</strong></span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {QUIZ_ITEMS.map((item, idx) => {
          const userChoice = selected[item.id];
          const isCorrect = userChoice === item.correct;

          return (
            <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 mb-3 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[11px] text-cyan-400 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{item.question}</span>
              </div>

              <div className="space-y-2">
                {item.options.map((opt, optIdx) => {
                  const isOptionSelected = userChoice === optIdx;
                  let btnClass = 'border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800/60';

                  if (submitted) {
                    if (optIdx === item.correct) {
                      btnClass = 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold';
                    } else if (isOptionSelected) {
                      btnClass = 'border-rose-500 bg-rose-950/60 text-rose-300';
                    } else {
                      btnClass = 'border-slate-900 text-slate-600';
                    }
                  } else if (isOptionSelected) {
                    btnClass = 'border-cyan-500 bg-cyan-950/70 text-cyan-200 shadow-sm';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelect(item.id, optIdx)}
                      className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between ${btnClass}`}
                    >
                      <span>{opt}</span>
                      {submitted && optIdx === item.correct && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {submitted && isOptionSelected && !isCorrect && (
                        <X className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <span className={isCorrect ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {isCorrect ? 'Correct!' : 'Note:'}
                  </span>{' '}
                  {item.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {!submitted ? (
          <button
            onClick={handleCheck}
            disabled={Object.keys(selected).length < QUIZ_ITEMS.length}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
              Object.keys(selected).length === QUIZ_ITEMS.length
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            Check Answers ({Object.keys(selected).length}/{QUIZ_ITEMS.length})
          </button>
        ) : (
          <span className="text-xs font-mono text-cyan-400">Completed!</span>
        )}
      </div>
    </div>
  );
};
