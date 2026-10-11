import { SimState, FrameStatus, ProtocolMode } from '../types/protocol';

export type { SimState, FrameStatus, ProtocolMode };

export function getFrameStatus(
  frameNum: number,
  start: number,
  windowSize: number,
  totalFrames: number,
  ack: number[],
  protocol: ProtocolMode = 'SELECTIVE_REPEAT'
): FrameStatus {
  if (frameNum < start) {
    return 'ACKED_SLID_PAST';
  }
  const windowEnd = Math.min(start + windowSize - 1, totalFrames);
  if (frameNum > windowEnd) {
    return 'QUEUED';
  }
  // Inside window
  if (protocol === 'SELECTIVE_REPEAT' && ack[frameNum] === 1) {
    return 'WINDOW_ACKED_OOO';
  }
  if (frameNum === start) {
    return 'WINDOW_BASE';
  }
  return 'WINDOW_UNACKED';
}

export function getFramesInWindow(start: number, windowSize: number, totalFrames: number): number[] {
  const frames: number[] = [];
  for (let i = start; i < start + windowSize && i <= totalFrames; i++) {
    frames.push(i);
  }
  return frames;
}

export function getUnackedInWindow(start: number, windowSize: number, totalFrames: number, ack: number[]): number[] {
  return getFramesInWindow(start, windowSize, totalFrames).filter(f => ack[f] === 0);
}

export function createInitialSimState(
  totalFrames = 6, 
  windowSize = 3, 
  protocol: ProtocolMode = 'SELECTIVE_REPEAT'
): SimState {
  const ack = new Array(Math.max(totalFrames + 5, 101)).fill(0);
  const isSR = protocol === 'SELECTIVE_REPEAT';

  return {
    protocol,
    totalFrames,
    windowSize,
    start: 1,
    ack,
    receivedAck: null,
    activeLine: isSR ? 18 : 20,
    phase: 'START_LOOP',
    logs: [
      { 
        id: '1', 
        type: 'system', 
        text: isSR 
          ? '===== Selective Repeat Sliding Window Protocol =====' 
          : '===== Go-Back-N Sliding Window Protocol =====' 
      },
      { id: '2', type: 'stdout', text: `Enter total number of frames: ${totalFrames}` },
      { id: '3', type: 'stdout', text: `Enter window size: ${windowSize}` },
      { 
        id: '4', 
        type: 'system', 
        text: `--- Initial state: start = 1. Window covers [1 .. ${Math.min(windowSize, totalFrames)}] ---` 
      },
    ],
    explanation: {
      title: 'Step 1: Check Outer Loop',
      detail: `Checking "while (start <= total_frames)". start = 1, total_frames = ${totalFrames}. 1 <= ${totalFrames} is TRUE. Entering loop.`,
      cCodeSnippet: isSR 
        ? `while (start <= total_frames) // 1 <= ${totalFrames} (TRUE)` 
        : `while (start <= total_frames) // 1 <= ${totalFrames} (TRUE)`,
      ruleInsight: isSR
        ? 'Selective Repeat: Each frame is acknowledged individually. Out-of-order packets are buffered!'
        : 'Go-Back-N: Uses cumulative acknowledgments. If a packet is lost, all frames from "start" are retransmitted!',
    },
    stepCount: 0,
    isComplete: false,
    lastLostFrame: null,
    retransmittedCount: 0,
  };
}

export function advanceStep(state: SimState): SimState {
  if (state.isComplete) return state;

  const nextLogs = [...state.logs];
  const nextAck = [...state.ack];
  const isSR = state.protocol === 'SELECTIVE_REPEAT';

  switch (state.phase) {
    case 'START_LOOP': {
      // Move to display window
      const unacked = getUnackedInWindow(state.start, state.windowSize, state.totalFrames, nextAck);
      nextLogs.push({
        id: String(Date.now() + Math.random()),
        type: 'stdout',
        text: `\nCurrent window: ${unacked.join(' ')}`,
      });
      return {
        ...state,
        phase: 'DISPLAY_WINDOW',
        activeLine: isSR ? 20 : 22,
        logs: nextLogs,
        stepCount: state.stepCount + 1,
        explanation: {
          title: 'Step 2: Print Current Window',
          detail: `Inspecting window [${state.start} .. ${Math.min(state.start + state.windowSize - 1, state.totalFrames)}]. Frames with ack[i]==0: [${unacked.join(', ')}].`,
          cCodeSnippet: isSR
            ? `for (i = start; i < start + window_size && i <= total_frames; i++) {\n  if (ack[i] == 0) printf("%d ", i);\n}`
            : `for (i = start; i < start + window_size && i <= total_frames; i++) {\n  if (ack[i] == 0) printf("%d ", i);\n}`,
          ruleInsight: isSR
            ? 'SR skips already-acknowledged frames inside the window.'
            : 'GBN inspects the window before transmitting.',
        },
      };
    }

    case 'DISPLAY_WINDOW': {
      const windowFrames = getFramesInWindow(state.start, state.windowSize, state.totalFrames);
      const unacked = getUnackedInWindow(state.start, state.windowSize, state.totalFrames, nextAck);

      // In GBN, lines 34-37 transmit ALL frames in window!
      // In SR, lines 30 transmit active frames
      const transmitList = isSR ? unacked : windowFrames;

      nextLogs.push({
        id: String(Date.now() + Math.random()),
        type: 'stdout',
        text: `Transmitting frames: ${transmitList.join(' ')}`,
      });
      nextLogs.push({
        id: String(Date.now() + Math.random()),
        type: 'stdout',
        text: isSR
          ? 'Enter ACK frame number (0 if frame is lost): '
          : 'Enter ACK received up to frame (0 if ACK is lost): ',
      });

      return {
        ...state,
        phase: 'WAITING_ACK',
        activeLine: isSR ? 36 : 41,
        logs: nextLogs,
        stepCount: state.stepCount + 1,
        explanation: {
          title: isSR ? 'Step 3: Transmit & Wait for Individual ACK' : 'Step 3: Transmit Entire Window & Wait for Cumulative ACK',
          detail: isSR
            ? `Transmitting [${transmitList.join(', ')}]. Paused at scanf() waiting for frame ACK (or 0 for loss).`
            : `GBN transmits ALL ${windowFrames.length} frames in the window [${windowFrames.join(', ')}]. Paused at scanf() waiting for cumulative ACK "up to frame" (or 0 for loss).`,
          cCodeSnippet: isSR
            ? `scanf("%d", &received_ack);`
            : `scanf("%d", &received_ack); // Cumulative ACK`,
          ruleInsight: isSR
            ? 'In SR, entering 3 means ONLY Frame 3 is acknowledged.'
            : 'In GBN, entering 3 is CUMULATIVE: it acknowledges Frame 1, Frame 2, AND Frame 3 all at once!',
        },
      };
    }

    case 'WAITING_ACK': {
      return state;
    }

    case 'HANDLE_ACK': {
      if (isSR) {
        // In SR: check while (start <= total_frames && ack[start] == 1)
        const canSlide = state.start <= state.totalFrames && nextAck[state.start] === 1;
        return {
          ...state,
          phase: canSlide ? 'SLIDING_STEP' : 'CHECK_SLIDE',
          activeLine: 57,
          stepCount: state.stepCount + 1,
          explanation: {
            title: 'Selective Repeat: Check Base Slide',
            detail: `Line 57: Testing if base frame start=${state.start} is acknowledged: ack[${state.start}] is ${nextAck[state.start]}. ${
              canSlide
                ? `YES! Base frame is ACKed. Window can slide forward!`
                : `NO! Base frame is still 0. Window cannot slide until frame ${state.start} arrives!`
            }`,
            cCodeSnippet: `while (start <= total_frames && ack[start] == 1) {\n  start++;\n}`,
            ruleInsight: 'The window is pinned at "start" until that specific oldest packet arrives.',
          },
        };
      } else {
        // In GBN: if ACK was valid, we already executed cumulative marking and start = received_ack + 1
        return {
          ...state,
          phase: 'CHECK_SLIDE',
          activeLine: 20,
          stepCount: state.stepCount + 1,
          explanation: {
            title: 'Go-Back-N: Window Position Updated',
            detail: `start is now ${state.start}. Next loop iteration will evaluate "while (start <= total_frames)".`,
            cCodeSnippet: `start = received_ack + 1; // start is now ${state.start}`,
            ruleInsight: 'In Go-Back-N, receiving a cumulative ACK moves the window base directly past all confirmed frames.',
          },
        };
      }
    }

    case 'SLIDING_STEP': {
      // SR only: start++
      const oldStart = state.start;
      const newStart = oldStart + 1;
      nextLogs.push({
        id: String(Date.now() + Math.random()),
        type: 'slide',
        text: `>> Window slid right: start advanced from ${oldStart} to ${newStart}`,
      });
      const canSlideAgain = newStart <= state.totalFrames && nextAck[newStart] === 1;
      return {
        ...state,
        start: newStart,
        phase: canSlideAgain ? 'SLIDING_STEP' : 'CHECK_SLIDE',
        activeLine: canSlideAgain ? 59 : 57,
        logs: nextLogs,
        stepCount: state.stepCount + 1,
        explanation: {
          title: `Window Slid to Frame ${newStart}`,
          detail: `start incremented from ${oldStart} to ${newStart}. ${
            canSlideAgain
              ? `Frame ${newStart} was already acknowledged (ack[${newStart}]==1)! Sliding continues immediately!`
              : `Frame ${newStart} is not acknowledged yet. Sliding stops.`
          }`,
          cCodeSnippet: `start++; // start = ${newStart}`,
          ruleInsight: 'Multi-slot jump: Out-of-order frames saved earlier are skipped all at once!',
        },
      };
    }

    case 'CHECK_SLIDE': {
      if (state.start > state.totalFrames) {
        nextLogs.push({
          id: String(Date.now() + Math.random()),
          type: 'stdout',
          text: '\nAll frames transmitted successfully.',
        });
        return {
          ...state,
          phase: 'DONE',
          activeLine: isSR ? 63 : 62,
          logs: nextLogs,
          isComplete: true,
          stepCount: state.stepCount + 1,
          explanation: {
            title: 'All Frames Completed! 🎉',
            detail: `start (${state.start}) > total_frames (${state.totalFrames}). Outer while-loop terminates. "All frames transmitted successfully."`,
            cCodeSnippet: `printf("\\nAll frames transmitted successfully.\\n");\nreturn 0;`,
            ruleInsight: isSR
              ? 'Selective Repeat transmitted with 0 redundant packet retransmissions!'
              : `Go-Back-N session finished. Total retransmitted packets due to GBN penalty: ${state.retransmittedCount}.`,
          },
        };
      } else {
        return {
          ...state,
          phase: 'START_LOOP',
          activeLine: isSR ? 18 : 20,
          stepCount: state.stepCount + 1,
          explanation: {
            title: 'Next Window Cycle',
            detail: `start (${state.start}) <= total_frames (${state.totalFrames}) is TRUE. Next window cycle begins at start = ${state.start}.`,
            cCodeSnippet: `while (start <= total_frames)`,
            ruleInsight: `Active window is now [${state.start} .. ${Math.min(state.start + state.windowSize - 1, state.totalFrames)}].`,
          },
        };
      }
    }

    case 'DONE':
      return state;

    default:
      return state;
  }
}

export function submitAck(state: SimState, ackNum: number): SimState {
  if (state.phase !== 'WAITING_ACK') return state;

  const nextLogs = [...state.logs];
  const nextAck = [...state.ack];
  const isSR = state.protocol === 'SELECTIVE_REPEAT';
  const windowFrames = getFramesInWindow(state.start, state.windowSize, state.totalFrames);
  const windowEnd = Math.min(state.start + state.windowSize - 1, state.totalFrames);

  nextLogs.push({
    id: String(Date.now() + Math.random()),
    type: 'stdin',
    text: String(ackNum),
  });

  // CASE 1: LOSS (ackNum === 0)
  if (ackNum === 0) {
    if (isSR) {
      // Selective Repeat Loss
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'loss', text: 'Frame lost!' });
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'loss', text: 'Selective Repeat: Retransmitting the lost frame only.' });
      return {
        ...state,
        receivedAck: 0,
        phase: 'HANDLE_ACK',
        activeLine: 41,
        logs: nextLogs,
        lastLostFrame: state.start,
        retransmittedCount: state.retransmittedCount + 1,
        stepCount: state.stepCount + 1,
        explanation: {
          title: 'Selective Repeat: Only Missing Frame Retransmitted',
          detail: 'Frame lost! Selective Repeat keeps all other received frames safely in memory and retransmits ONLY the lost frame.',
          cCodeSnippet: `if (received_ack == 0) {\n  printf("Frame lost!\\n");\n  printf("Selective Repeat: Retransmitting the lost frame only.\\n");\n}`,
          ruleInsight: 'No redundant traffic. Link bandwidth is conserved.',
        },
      };
    } else {
      // Go-Back-N Loss
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'loss', text: 'ACK lost!' });
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'loss', text: `Go-Back-N: Retransmitting from frame ${state.start}` });
      return {
        ...state,
        receivedAck: 0,
        phase: 'HANDLE_ACK',
        activeLine: 46,
        logs: nextLogs,
        lastLostFrame: state.start,
        retransmittedCount: state.retransmittedCount + windowFrames.length,
        stepCount: state.stepCount + 1,
        explanation: {
          title: 'Go-Back-N Penalty: Retransmitting From Start!',
          detail: `ACK lost! Go-Back-N must restart all the way back at start=${state.start} and retransmit ALL ${windowFrames.length} frames in the window [${windowFrames.join(', ')}], even if later frames arrived safely!`,
          cCodeSnippet: `if (received_ack == 0) {\n  printf("ACK lost!\\n");\n  printf("Go-Back-N: Retransmitting from frame %d\\n", start);\n}`,
          ruleInsight: `Notice the huge penalty: GBN re-sends ${windowFrames.length} frames, wasting bandwidth!`,
        },
      };
    }
  }

  // CASE 2: POSITIVE ACK
  const isValid = ackNum >= state.start && ackNum <= windowEnd && ackNum <= state.totalFrames;

  if (isSR) {
    // Selective Repeat Individual ACK
    if (isValid) {
      nextAck[ackNum] = 1;
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'stdout', text: `ACK received for frame ${ackNum}` });
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'stdout', text: `Frame ${ackNum} acknowledged.` });
      return {
        ...state,
        ack: nextAck,
        receivedAck: ackNum,
        phase: 'HANDLE_ACK',
        activeLine: 48,
        logs: nextLogs,
        lastLostFrame: null,
        stepCount: state.stepCount + 1,
        explanation: {
          title: `SR: ACK for Frame ${ackNum} Recorded`,
          detail: `ack[${ackNum}] = 1. Frame ${ackNum} is individually acknowledged in the scoreboard.`,
          cCodeSnippet: `ack[received_ack] = 1; // ack[${ackNum}] = 1`,
          ruleInsight: ackNum === state.start
            ? 'This was the base frame! Window will slide forward on next step.'
            : `Out-of-order ACK! Saved in buffer, but window cannot slide past start=${state.start} yet.`,
        },
      };
    } else {
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'stdout', text: 'Invalid ACK!' });
      return {
        ...state,
        receivedAck: ackNum,
        phase: 'HANDLE_ACK',
        activeLine: 54,
        logs: nextLogs,
        stepCount: state.stepCount + 1,
        explanation: {
          title: 'Invalid ACK',
          detail: `ACK ${ackNum} is outside current window [${state.start} .. ${windowEnd}].`,
          cCodeSnippet: `printf("Invalid ACK!\\n");`,
          ruleInsight: 'Out-of-bounds ACKs are discarded.',
        },
      };
    }
  } else {
    // Go-Back-N Cumulative ACK
    if (isValid) {
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'stdout', text: `ACK received up to frame ${ackNum}` });

      // Mark all frames from start to received_ack as 1
      for (let i = state.start; i <= ackNum && i <= state.totalFrames; i++) {
        nextAck[i] = 1;
      }

      const newStart = ackNum + 1;
      nextLogs.push({
        id: String(Date.now() + Math.random()),
        type: 'slide',
        text: `>> Go-Back-N Cumulative Slide: start jumped from ${state.start} to ${newStart}`,
      });

      return {
        ...state,
        ack: nextAck,
        start: newStart,
        receivedAck: ackNum,
        phase: 'HANDLE_ACK',
        activeLine: 58,
        logs: nextLogs,
        lastLostFrame: null,
        stepCount: state.stepCount + 1,
        explanation: {
          title: `GBN: Cumulative ACK Up To Frame ${ackNum}`,
          detail: `Cumulative ACK ${ackNum} confirmed all frames from ${state.start} through ${ackNum}! start jumped directly to ${newStart}.`,
          cCodeSnippet: `for (i = start; i <= received_ack && i <= total_frames; i++) ack[i] = 1;\nstart = received_ack + 1; // start = ${newStart}`,
          ruleInsight: `Notice how one cumulative ACK cleared ${ackNum - state.start + 1} frames simultaneously!`,
        },
      };
    } else {
      nextLogs.push({ id: String(Date.now() + Math.random()), type: 'stdout', text: `Invalid ACK ${ackNum}!` });
      return {
        ...state,
        receivedAck: ackNum,
        phase: 'HANDLE_ACK',
        activeLine: 49,
        logs: nextLogs,
        stepCount: state.stepCount + 1,
        explanation: {
          title: 'Invalid Cumulative ACK',
          detail: `ACK ${ackNum} is outside range [${state.start} .. ${windowEnd}].`,
          cCodeSnippet: `// Out of range ACK`,
          ruleInsight: 'ACK must be within the active window.',
        },
      };
    }
  }
}
