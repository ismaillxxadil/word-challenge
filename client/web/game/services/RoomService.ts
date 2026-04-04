import { Socket } from "socket.io-client";
import { Room } from "@/app/types";
import { RoomSocket } from "@/game/network/RoomSocket";

export type RoomSettings = {
  timePerTurn: number;
  startingCards: number;
  allowVar: boolean;
  allowLockCard: boolean;
  varDuration?: number;
  varExplanationDuration?: number;
  noRepeatWords?: boolean;
  maxRepeatCount?: number;
};

type RoomStoreAdapter = {
  getSettings: () => RoomSettings;
  setRoom: (room: Room | null) => void;
  setError: (error: string) => void;
  setShowJoinModal: (show: boolean) => void;
  setIsConnectingToRoom: (connecting: boolean) => void;
  setSettings: (settings: RoomSettings) => void;
  setSocket: (socket: Socket | null) => void;
};

export class RoomService {
  private roomSocket: RoomSocket | null = null;

  private readonly onConnect = () => {
    if (!this.pendingJoin) return;
    this.roomSocket?.emit("room:join", this.pendingJoin);
  };

  private readonly onSnapshot = (payload: { room: Room }) => {
    const serverSettings = payload.room.state?.settings;
    this.adapter.setRoom(payload.room);
    this.adapter.setIsConnectingToRoom(false);
    this.adapter.setError("");
    this.adapter.setShowJoinModal(false);
    if (serverSettings) {
      this.adapter.setSettings({
        ...this.adapter.getSettings(),
        ...serverSettings,
      });
    }
  };

  private readonly onUpdate = (payload: { room: Room }) => {
    const serverSettings = payload.room.state?.settings;
    this.adapter.setRoom(payload.room);
    if (serverSettings) {
      this.adapter.setSettings({
        ...this.adapter.getSettings(),
        ...serverSettings,
      });
    }
  };

  private readonly onSettingsUpdate = (payload: { settings: RoomSettings }) => {
    this.adapter.setSettings(payload.settings);
  };

  private readonly onPlayerRemoved = () => {
    this.cleanupSocket();
    this.adapter.setSocket(null);
    this.adapter.setRoom(null);
    this.adapter.setError("");
    this.adapter.setShowJoinModal(false);
    this.adapter.setIsConnectingToRoom(false);
  };

  private readonly onRoomError = (payload: { message: string }) => {
    if (payload?.message === "Player not found") {
      localStorage.removeItem("vc:playerId");
      this.adapter.setError("");
      this.adapter.setShowJoinModal(true);
      this.adapter.setIsConnectingToRoom(false);
      return;
    }

    this.adapter.setError(payload?.message || "خطأ في الغرفة");
  };

  private pendingJoin: { roomCode: string; playerId: string } | null = null;

  constructor(
    private readonly adapter: RoomStoreAdapter,
    private readonly serverUrl: string,
  ) {}
  // Initializes the socket connection if not already initialized and returns the socket instance
  initializeSocket(): Socket {
    if (!this.roomSocket) {
      this.roomSocket = new RoomSocket(this.serverUrl);
      this.adapter.setSocket(this.roomSocket.instance);
    }

    return this.roomSocket.instance;
  }

  getSocket(): Socket | null {
    return this.roomSocket?.instance ?? null;
  }

  connectToRoom(roomCode: string, playerId: string) {
    this.pendingJoin = { roomCode, playerId };
    this.initializeSocket();
    this.registerListeners();

    if (this.roomSocket?.instance.connected) {
      this.roomSocket.emit("room:join", this.pendingJoin);
      return;
    }

    this.roomSocket?.connect();
  }

  leaveRoom(roomCode: string, playerId: string) {
    if (this.roomSocket && roomCode && playerId) {
      this.roomSocket.emit("room:leave", { roomCode, playerId });
    }
    this.cleanupSocket();
    this.pendingJoin = null;
    this.adapter.setSocket(null);
  }

  disconnect() {
    this.cleanupSocket();
    this.pendingJoin = null;
    this.adapter.setSocket(null);
  }

  private registerListeners() {
    if (!this.roomSocket) return;

    this.roomSocket.off(
      "connect",
      this.onConnect as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:snapshot",
      this.onSnapshot as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:update",
      this.onUpdate as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:settings-update",
      this.onSettingsUpdate as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:player-removed",
      this.onPlayerRemoved as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:error",
      this.onRoomError as (...args: unknown[]) => void,
    );

    this.roomSocket.on(
      "connect",
      this.onConnect as (...args: unknown[]) => void,
    );
    this.roomSocket.on(
      "room:snapshot",
      this.onSnapshot as (...args: unknown[]) => void,
    );
    this.roomSocket.on(
      "room:update",
      this.onUpdate as (...args: unknown[]) => void,
    );
    this.roomSocket.on(
      "room:settings-update",
      this.onSettingsUpdate as (...args: unknown[]) => void,
    );
    this.roomSocket.on(
      "room:player-removed",
      this.onPlayerRemoved as (...args: unknown[]) => void,
    );
    this.roomSocket.on(
      "room:error",
      this.onRoomError as (...args: unknown[]) => void,
    );
  }

  private cleanupSocket() {
    if (!this.roomSocket) return;

    this.roomSocket.off(
      "connect",
      this.onConnect as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:snapshot",
      this.onSnapshot as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:update",
      this.onUpdate as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:settings-update",
      this.onSettingsUpdate as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:player-removed",
      this.onPlayerRemoved as (...args: unknown[]) => void,
    );
    this.roomSocket.off(
      "room:error",
      this.onRoomError as (...args: unknown[]) => void,
    );
    this.roomSocket.disconnect();
    this.roomSocket = null;
  }
}
