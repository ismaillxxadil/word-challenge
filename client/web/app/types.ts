export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  socketId: string | null;
  // In-game: cards assigned by the server (each card has 2 letters)
  cards?: { id: string; letterA: string; letterB: string }[];
  // Avatar URL chosen by the player (DiceBear or custom)
  avatar?: string | null;
};

export type RoomState = {
  phase: string;
  turnIndex: number;
  // When the game started
  startedAt: number | null;
  // When the current turn started (used for timers)
  turnStartedAt: number | null;
  // Index into room.players for whose turn it is
  currentPlayerIndex: number | null;
  // 3-letter center word
  centerWord: string | null;
  playedWords: string[];
  settings: {
    startingCards: number;
    allowVar: boolean;
    timePerTurn: number;
  };
};

export type Room = {
  code: string;
  players: Player[];
  createdAt: number;
  state: RoomState;
};
