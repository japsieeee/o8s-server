import { Injectable } from '@nestjs/common';

@Injectable()
export class WsAuthGuard {
  canActivate(wsToken: string): boolean {
    if (wsToken !== process.env.WS_TOKEN) {
      return false;
    }

    return true;
  }
}
