export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: number;
  socketId: string | null;
};

export type Room = {
  code: string;
  players: Player[];
  createdAt: number;
  state: {
    phase: string;
    turnIndex: number;
    startedAt: number | null;
  };
};
