export type ProtocolMode = 'SELECTIVE_REPEAT' | 'GO_BACK_N';

export type FrameStatus = 
  | 'QUEUED'           // Outside window, not yet sent
  | 'WINDOW_BASE'      // Window base 'start' (unacknowledged, blocking slide)
  | 'WINDOW_UNACKED'   // In window, sent, waiting for ACK
  | 'WINDOW_ACKED_OOO' // In window, selectively acknowledged out-of-order (SR only)
  | 'ACKED_SLID_PAST'; // Acknowledged and slid out of the window

export interface SimState {
  protocol: ProtocolMode;
  totalFrames: number;
  windowSize: number;
  start: number;
  ack: number[]; // 1-indexed, 0 = unacked, 1 = acked
  receivedAck: number | null;
  activeLine: number;
  phase: 
    | 'START_LOOP'
    | 'DISPLAY_WINDOW'
    | 'TRANSMIT'
    | 'WAITING_ACK'
    | 'HANDLE_ACK'
    | 'CHECK_SLIDE'
    | 'SLIDING_STEP'
    | 'GBN_CUMULATIVE_UPDATE'
    | 'DONE';
  logs: Array<{
    id: string;
    type: 'system' | 'stdout' | 'stdin' | 'slide' | 'loss' | 'highlight';
    text: string;
  }>;
  explanation: {
    title: string;
    detail: string;
    cCodeSnippet: string;
    ruleInsight: string;
  };
  stepCount: number;
  isComplete: boolean;
  lastLostFrame?: number | null;
  retransmittedCount: number;
}
