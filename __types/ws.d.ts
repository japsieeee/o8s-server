import 'socket.io';

declare module 'socket.io' {
  interface Socket {
    isBrowser: boolean;
    isAgent: boolean;

    agentInformation: {
      clusterId?: string;
      id?: string;
    };

    browserInformation: {
      id?: string;
    };
  }
}
