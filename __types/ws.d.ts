import 'socket.io';

declare module 'socket.io' {
  interface Socket {
    agentId?: string;
    clusterId?: string;
    browserClientId?: string;
  }
}
