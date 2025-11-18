import { Connection, FlowNode, FlowchartOperation, CollaborationUser } from '../types';

export interface CollaborationStateMessage {
  nodes: FlowNode[];
  connections: Connection[];
  updatedAt: number;
}

export type CollaborationMessageType =
  | 'join'
  | 'presence'
  | 'state'
  | 'operation'
  | 'selection'
  | 'cursor';

export interface CollaborationMessage {
  type: CollaborationMessageType;
  userId: string;
  timestamp: number;
  payload?: unknown;
}

const randomColor = () => {
  const colors = ['#F87171', '#34D399', '#60A5FA', '#FBBF24', '#A78BFA', '#F472B6'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const randomName = () => `User-${Math.floor(Math.random() * 999)}`;

const getRandomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class CollaborationService {
  private channel: BroadcastChannel | null = null;
  private users = new Map<string, CollaborationUser>();
  private ready = false;
  private reconnectAttempts = 0;

  onUsersUpdate?: (users: CollaborationUser[]) => void;
  onRemoteState?: (message: CollaborationStateMessage) => void;
  onRemoteOperation?: (operation: FlowchartOperation) => void;

  constructor(private roomId: string, private maxReconnects = 3) {}

  async connect(user?: Partial<CollaborationUser>): Promise<boolean> {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
      console.warn('BroadcastChannel indisponível neste ambiente.');
      return false;
    }

    const localUser: CollaborationUser = {
      id: user?.id || getRandomId(),
      name: user?.name || randomName(),
      color: user?.color || randomColor(),
      avatar: user?.avatar,
      cursorPosition: undefined,
    };

    this.users.set(localUser.id, localUser);
    this.onUsersUpdate?.(Array.from(this.users.values()));

    this.channel = new BroadcastChannel(`flow-collab-${this.roomId}`);
    this.channel.onmessage = event => this.handleMessage(event.data as CollaborationMessage);
    this.ready = true;
    this.postMessage({ type: 'join', userId: localUser.id, timestamp: Date.now(), payload: localUser });
    return true;
  }

  disconnect() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.ready = false;
  }

  private handleMessage(message: CollaborationMessage) {
    if (!message || !message.userId) {
      return;
    }

    const user = this.users.get(message.userId);
    if (message.type === 'join' && !user) {
      this.users.set(message.userId, {
        id: message.userId,
        name: (message.payload as CollaborationUser | undefined)?.name || randomName(),
        color: (message.payload as CollaborationUser | undefined)?.color || randomColor(),
      });
      this.broadcastPresence();
      return;
    }

    if (message.type === 'presence') {
      const payload = message.payload as CollaborationUser[];
      payload.forEach(remoteUser => this.users.set(remoteUser.id, remoteUser));
      this.onUsersUpdate?.(Array.from(this.users.values()));
      return;
    }

    if (message.type === 'state') {
      this.onRemoteState?.(message.payload as CollaborationStateMessage);
      return;
    }

    if (message.type === 'operation') {
      this.onRemoteOperation?.(message.payload as FlowchartOperation);
      return;
    }

    if (message.type === 'selection') {
      const payload = message.payload as { selectedNodeId: string | null };
      const collaborator = this.users.get(message.userId);
      if (collaborator) {
        collaborator.selectedNodeId = payload.selectedNodeId;
        collaborator.lastSeen = Date.now();
        this.onUsersUpdate?.(Array.from(this.users.values()));
      }
      return;
    }

    if (message.type === 'cursor') {
      const payload = message.payload as { position: { x: number; y: number } };
      const collaborator = this.users.get(message.userId);
      if (collaborator) {
        collaborator.cursorPosition = payload.position;
        collaborator.lastSeen = Date.now();
        this.onUsersUpdate?.(Array.from(this.users.values()));
      }
    }
  }

  private postMessage(message: CollaborationMessage) {
    if (!this.channel || !this.ready) {
      return;
    }
    this.channel.postMessage(message);
  }

  broadcastPresence() {
    this.postMessage({
      type: 'presence',
      userId: Array.from(this.users.keys())[0] || 'local',
      timestamp: Date.now(),
      payload: Array.from(this.users.values()),
    });
  }

  sendState(state: CollaborationStateMessage) {
    this.postMessage({
      type: 'state',
      userId: Array.from(this.users.keys())[0] || 'local',
      timestamp: Date.now(),
      payload: state,
    });
  }

  sendOperation(operation: FlowchartOperation) {
    this.postMessage({
      type: 'operation',
      userId: Array.from(this.users.keys())[0] || 'local',
      timestamp: Date.now(),
      payload: operation,
    });
  }

  sendSelection(selectedNodeId: string | null) {
    this.postMessage({
      type: 'selection',
      userId: Array.from(this.users.keys())[0] || 'local',
      timestamp: Date.now(),
      payload: { selectedNodeId },
    });
  }

  sendCursor(position: { x: number; y: number }) {
    this.postMessage({
      type: 'cursor',
      userId: Array.from(this.users.keys())[0] || 'local',
      timestamp: Date.now(),
      payload: { position },
    });
  }
}
