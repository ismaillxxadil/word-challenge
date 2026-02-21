import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { Room } from "@/app/types";

interface RoomStore {
  // State
  room: Room | null;
  socket: Socket | null;
  error: string;
  showJoinModal: boolean;
  isConnectingToRoom: boolean;
  settings: {
    timePerTurn: number;
    startingCards: number;
    allowVar: boolean;
    varDuration?: number;
    varExplanationDuration?: number;
  };
  roomLinkCopied: boolean;

  // Actions
  setRoom: (room: Room | null) => void;
  setError: (error: string) => void;
  setShowJoinModal: (show: boolean) => void;
  setIsConnectingToRoom: (connecting: boolean) => void;
  setSettings: (settings: {
    timePerTurn: number;
    startingCards: number;
    allowVar: boolean;
    varDuration?: number;
    varExplanationDuration?: number;
  }) => void;
  setRoomLinkCopied: (copied: boolean) => void;
  initializeSocket: () => Socket;
  connectToRoom: (roomCode: string, playerId: string) => void;
  leaveRoom: (roomCode: string, playerId: string) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  socket: null,
  error: "",
  showJoinModal: false,
  isConnectingToRoom: false,
  roomLinkCopied: false,
  settings: {
    timePerTurn: 15,
    startingCards: 7,
    allowVar: true,
    varDuration: 15,
    varExplanationDuration: 15,
  },

  setRoom: (room) => set({ room }),
  setError: (error) => set({ error }),
  setShowJoinModal: (show) => set({ showJoinModal: show }),
  setIsConnectingToRoom: (connecting) =>
    set({ isConnectingToRoom: connecting }),
  setSettings: (settings) => set({ settings }),
  setRoomLinkCopied: (copied) => set({ roomLinkCopied: copied }),

  initializeSocket: () => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
    });
    set({ socket });
    return socket;
  },

  connectToRoom: (roomCode: string, playerId: string) => {
    let socket = get().socket;
    if (!socket) {
      socket = get().initializeSocket();
    }

    socket.connect();

    const onConnect = () => {
      socket.emit("room:join", { roomCode, playerId });
    };

    const onSnapshot = (payload: { room: Room }) => {
      const serverSettings = payload.room.state?.settings;
      set({ 
        room: payload.room, 
        isConnectingToRoom: false, 
        error: "",
        // Sync settings from server if they exist
        settings: serverSettings ? { ...get().settings, ...serverSettings } : get().settings
      });
    };

    const onUpdate = (payload: { room: Room }) => {
      const serverSettings = payload.room.state?.settings;
      set((state) => ({ 
        room: payload.room,
        // Sync settings on update too
        settings: serverSettings ? { ...state.settings, ...serverSettings } : state.settings
      }));
    };

    const onSettingsUpdate = (payload: {
      settings: {
        timePerTurn: number;
        startingCards: number;
        allowVar: boolean;
      };
    }) => {
      set({ settings: payload.settings });
    };

    const onPlayerRemoved = () => {
      get().reset();
    };

    const onRoomError = (payload: { message: string }) => {
      set({ error: payload?.message || "خطأ في الغرفة" });
    };

    socket.on("connect", onConnect);
    socket.on("room:snapshot", onSnapshot);
    socket.on("room:update", onUpdate);
    socket.on("room:settings-update", onSettingsUpdate);
    socket.on("room:player-removed", onPlayerRemoved);
    socket.on("room:error", onRoomError);
  },

  leaveRoom: (roomCode: string, playerId: string) => {
    const socket = get().socket;
    if (socket && playerId && roomCode) {
      socket.emit("room:leave", { roomCode, playerId });
      socket.disconnect();
    }
    get().reset();
  },

  reset: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
    }

    set({
      room: null,
      socket: null,
      error: "",
      showJoinModal: false,
      isConnectingToRoom: false,
      roomLinkCopied: false,
      settings: { timePerTurn: 15, startingCards: 7, allowVar: true },
    });
  },
}));
