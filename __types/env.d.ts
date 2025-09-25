declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: string;
      WS_TOKEN: string;
    }
  }
}

export {};
