import { create } from "zustand";
import { Socket } from "socket.io-client";
import { Room } from "@/app/types";
import { RoomService, RoomSettings } from "@/game/services/RoomService";

interface RoomStore {
  room: Room | null;
  socket: Socket | null;
  error: string;
  showJoinModal: boolean;
  isConnectingToRoom: boolean;
  settings: RoomSettings;
  roomLinkCopied: boolean;

  setRoom: (room: Room | null) => void;
  setSocket: (socket: Socket | null) => void;
  setError: (error: string) => void;
  setShowJoinModal: (show: boolean) => void;
  setIsConnectingToRoom: (connecting: boolean) => void;
  setSettings: (settings: RoomSettings) => void;
  setRoomLinkCopied: (copied: boolean) => void;

  initializeSocket: () => Socket;
  connectToRoom: (roomCode: string, playerId: string) => void;
  leaveRoom: (roomCode: string, playerId: string) => void;
  reset: () => void;
}

const defaultSettings: RoomSettings = {
  timePerTurn: 15,
  startingCards: 7,
  allowVar: true,
  allowLockCard: true,
  varDuration: 15,
  varExplanationDuration: 15,
  noRepeatWords: false,
  maxRepeatCount: 1,
};

let roomService: RoomService | null = null;

function getRoomService(
  get: () => RoomStore,
  set: (partial: Partial<RoomStore>) => void,
): RoomService {
  if (!roomService) {
    roomService = new RoomService(
      {
        getSettings: () => get().settings,
        setRoom: (room) => set({ room }),
        setError: (error) => set({ error }),
        setShowJoinModal: (showJoinModal) => set({ showJoinModal }),
        setIsConnectingToRoom: (isConnectingToRoom) =>
          set({ isConnectingToRoom }),
        setSettings: (settings) => set({ settings }),
        setSocket: (socket) => set({ socket }),
      },
      process.env.NEXT_PUBLIC_API_URL as string,
    );
  }

  return roomService;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  socket: null,
  error: "",
  showJoinModal: false,
  isConnectingToRoom: false,
  roomLinkCopied: false,
  settings: defaultSettings,

  setRoom: (room) => set({ room }),
  setSocket: (socket) => set({ socket }),
  setError: (error) => set({ error }),
  setShowJoinModal: (show) => set({ showJoinModal: show }),
  setIsConnectingToRoom: (connecting) =>
    set({ isConnectingToRoom: connecting }),
  setSettings: (settings) => set({ settings }),
  setRoomLinkCopied: (copied) => set({ roomLinkCopied: copied }),

  initializeSocket: () => getRoomService(get, set).initializeSocket(),

  connectToRoom: (roomCode: string, playerId: string) => {
    getRoomService(get, set).connectToRoom(roomCode, playerId);
  },

  leaveRoom: (roomCode: string, playerId: string) => {
    getRoomService(get, set).leaveRoom(roomCode, playerId);
    get().reset();
  },

  reset: () => {
    getRoomService(get, set).disconnect();

    set({
      room: null,
      socket: null,
      error: "",
      showJoinModal: false,
      isConnectingToRoom: false,
      roomLinkCopied: false,
      settings: defaultSettings,
    });
  },
}));

export type { RoomStore, RoomSettings };
