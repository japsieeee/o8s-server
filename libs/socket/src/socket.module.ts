import { Global, Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';

@Global()
@Module({
  providers: [SocketService, SocketGateway],
  exports: [SocketService],
})
export class SocketModule {}
