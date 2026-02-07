
export type StreamStatus = 'idle' | 'starting' | 'live' | 'error';

export interface BroadcasterState {
  isStreaming: boolean;
  peerId: string | null;
  listenerCount: number;
  status: StreamStatus;
}

export interface ListenerState {
  isConnected: boolean;
  isAudioPlaying: boolean;
  status: 'connecting' | 'connected' | 'idle' | 'offline';
}
