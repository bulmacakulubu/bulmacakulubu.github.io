import { Peer, DataConnection } from 'peerjs';
import { GameId } from '../types';

export interface MultiplayerMessage {
  type: 'HANDSHAKE' | 'MOVE' | 'WORD' | 'CHAT' | 'RESTART' | 'SURRENDER' | 'PING' | 'PONG';
  payload?: any;
  senderName?: string;
  timestamp?: number;
}

export class MultiplayerService {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private onDataCallback: ((msg: MultiplayerMessage) => void) | null = null;
  private onConnectCallback: ((opponentName: string) => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  public currentRoomCode: string | null = null;
  public isHost: boolean = false;
  public opponentName: string = 'Rakip';

  // Generate a friendly 6-digit room code like BK-8492
  public static generateRoomCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `BK-${code}`;
  }

  private getPeerId(roomCode: string): string {
    // Prefix to avoid collisions on public peerjs server
    const sanitized = roomCode.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `bk-duel-v1-${sanitized}`;
  }

  // Host creates room
  public hostRoom(
    roomCode: string,
    gameId: GameId,
    hostName: string,
    callbacks: {
      onConnect: (opponentName: string) => void;
      onData: (msg: MultiplayerMessage) => void;
      onDisconnect: () => void;
      onError: (err: string) => void;
    }
  ): void {
    this.cleanup();
    this.currentRoomCode = roomCode;
    this.isHost = true;
    this.onConnectCallback = callbacks.onConnect;
    this.onDataCallback = callbacks.onData;
    this.onDisconnectCallback = callbacks.onDisconnect;
    this.onErrorCallback = callbacks.onError;

    const peerId = this.getPeerId(roomCode);
    this.peer = new Peer(peerId, {
      debug: 1,
    });

    this.peer.on('open', () => {
      // Room opened and waiting for peer
    });

    this.peer.on('connection', (conn) => {
      this.connection = conn;
      this.setupConnection(hostName);
    });

    this.peer.on('error', (err: any) => {
      if (err.type === 'unavailable-id') {
        callbacks.onError('Bu oda kodu zaten kullanımda. Lütfen yeni bir oda oluşturun.');
      } else {
        callbacks.onError('Bağlantı hatası: ' + (err.message || 'Bilinmeyen hata'));
      }
    });
  }

  // Guest joins existing room
  public joinRoom(
    roomCode: string,
    guestName: string,
    callbacks: {
      onConnect: (opponentName: string) => void;
      onData: (msg: MultiplayerMessage) => void;
      onDisconnect: () => void;
      onError: (err: string) => void;
    }
  ): void {
    this.cleanup();
    this.currentRoomCode = roomCode;
    this.isHost = false;
    this.onConnectCallback = callbacks.onConnect;
    this.onDataCallback = callbacks.onData;
    this.onDisconnectCallback = callbacks.onDisconnect;
    this.onErrorCallback = callbacks.onError;

    // Guest gets an auto-assigned peer ID
    this.peer = new Peer({
      debug: 1,
    });

    this.peer.on('open', () => {
      const hostPeerId = this.getPeerId(roomCode);
      const conn = this.peer!.connect(hostPeerId, {
        reliable: true,
      });
      this.connection = conn;
      this.setupConnection(guestName);
    });

    this.peer.on('error', (err: any) => {
      if (err.type === 'peer-unavailable') {
        callbacks.onError('Oda bulunamadı veya oda sahibi henüz bağlanmadı. Oda kodunu kontrol edin.');
      } else {
        callbacks.onError('Bağlantı hatası: ' + (err.message || 'Bilinmeyen hata'));
      }
    });
  }

  private setupConnection(userName: string): void {
    if (!this.connection) return;

    this.connection.on('open', () => {
      // Send handshake
      this.sendMessage({
        type: 'HANDSHAKE',
        senderName: userName,
        payload: { isHost: this.isHost },
      });
    });

    this.connection.on('data', (raw: any) => {
      const msg = raw as MultiplayerMessage;
      if (msg.type === 'HANDSHAKE') {
        this.opponentName = msg.senderName || 'Rakip';
        if (this.onConnectCallback) {
          this.onConnectCallback(this.opponentName);
        }
      } else if (this.onDataCallback) {
        this.onDataCallback(msg);
      }
    });

    this.connection.on('close', () => {
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    });

    this.connection.on('error', () => {
      if (this.onErrorCallback) {
        this.onErrorCallback('Veri iletimi sırasında bağlantı kesildi.');
      }
    });
  }

  public sendMessage(msg: MultiplayerMessage): boolean {
    if (this.connection && this.connection.open) {
      this.connection.send({
        ...msg,
        timestamp: Date.now(),
      });
      return true;
    }
    return false;
  }

  public cleanup(): void {
    if (this.connection) {
      try {
        this.connection.close();
      } catch {
        // ignore
      }
      this.connection = null;
    }
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch {
        // ignore
      }
      this.peer = null;
    }
    this.currentRoomCode = null;
  }
}

export const multiplayerService = new MultiplayerService();

