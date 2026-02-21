export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  socketId: string | null;
  // In-game: cards assigned by the server (each card has 2 letters)
  cards?: { id: string; letterA: string; letterB: string; isSpecial?: boolean }[];
  // Avatar URL chosen by the player (DiceBear or custom)
  avatar?: string | null;
  // VAR status
  useVar?: boolean;
};

export interface PlayedWord {
  ok: boolean;
  type?: string; // 'timeout', 'var_result', etc
  playerId?: string | null;
  at: number;
  // specific to valid move
  centerWordBefore?: string;
  centerWordAfter?: string;
  move?: {
    card: { id: string; letterA: string; letterB: string };
    pick: "A" | "B";
    targetIndex: number;
  };
  // specific to invalid move
  attempt?: {
    card: { id: string; letterA: string; letterB: string };
    pick: "A" | "B";
    targetIndex: number;
    newWord: string;
  };
  // specific to var_result
  result?: "ACCEPT" | "REJECT";
  reason?: string;
  challengerId?: string;
  accusedId?: string;
  votesCount?: {
    accept: number;
    reject: number;
    eligible: number;
    needed: number;
  };
}

export interface VarSession {
  id: string;
  challengerId: string;
  accusedId: string;
  eligibleVoters: string[];
  votes: Record<string, "ACCEPT" | "REJECT">;
  startedAt: number;
  neededToWin: number;
  expiresAt: number;
  durationSeconds: number;
  status?: "awaiting_explanation" | "voting";
  explanation?: string | null;
  resolved: boolean;
  snapshot: {
    at: number;
    centerWordBefore: string;
    centerWordAfter: string;
    move: {
      card: { id: string; letterA: string; letterB: string; isSpecial?: boolean };
      pick: "A" | "B";
      targetIndex: number;
    };
  };
}

export type RoomState = {
  phase: string; // 'lobby', 'in-game', 'var', 'pending-win', 'game-over'
  turnIndex: number;
  // When the game started
  startedAt: number | null;
  // When the current turn started (used for timers)
  turnStartedAt: number | null;
  // Index into room.players for whose turn it is
  currentPlayerIndex: number | null;
  // 3-letter center word
  centerWord: string | null;
  playedWords: PlayedWord[];
  varSession?: VarSession | null;
  settings: {
    startingCards: number;
    allowVar: boolean;
    timePerTurn: number;
    varDuration?: number;
    varExplanationDuration?: number;
  };
  winner?: string | null;
  pendingWinner?: string | null;
  winTimeoutTimer?: NodeJS.Timeout | null;
};

export type Room = {
  code: string;
  players: Player[];
  createdAt: number;
  state: RoomState;
};
