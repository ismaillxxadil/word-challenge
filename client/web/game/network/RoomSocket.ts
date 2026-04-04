import { io, Socket } from "socket.io-client";

type SocketEventHandler = (...args: unknown[]) => void;

export class RoomSocket {
  private socket: Socket;

  constructor(serverUrl: string) {
    this.socket = io(serverUrl, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
    });
  }

  get instance(): Socket {
    return this.socket;
  }

  connect() {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  emit<TPayload>(
    event: string,
    payload?: TPayload,
    ack?: (...args: unknown[]) => void,
  ) {
    if (ack) {
      this.socket.emit(event, payload, ack);
      return;
    }

    if (payload === undefined) {
      this.socket.emit(event);
      return;
    }

    this.socket.emit(event, payload);
  }

  on(event: string, handler: SocketEventHandler) {
    this.socket.on(event, handler);
  }

  off(event: string, handler?: SocketEventHandler) {
    if (handler) {
      this.socket.off(event, handler);
      return;
    }

    this.socket.off(event);
  }
}
