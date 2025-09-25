import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsAuthGuard } from './socket.guard';
import { EventMetricsResponse } from './types/event-response.types';

@WebSocketGateway({
  cors: { origin: '*' }, // adjust as needed
})
export class SocketGateway implements OnGatewayInit {
  private readonly logger = new Logger(SocketGateway.name);
  private guard = new WsAuthGuard();

  @WebSocketServer()
  server: Server;

  afterInit(server: Server): void {
    this.server = server;

    this.server.on('connection', (socket: Socket) => {
      const browserClientId = socket.handshake.auth['browserClientId'] as string;
      const wsToken = socket.handshake.auth['wsToken'] as string;
      const agentId = socket.handshake.auth['agentId'] as string;
      const clusterId = socket.handshake.auth['clusterId'] as string;

      if (!this.guard.canActivate(wsToken)) {
        this.logger.warn(`Unauthorized connection attempt with token: ${wsToken}`);
        socket.disconnect(true);
        return;
      }

      // attach agent metadata
      if (clusterId) socket.clusterId = clusterId;
      if (agentId) socket.agentId = agentId;

      if (browserClientId) {
        const metricsRoom = `metrics:${socket.clusterId ?? 'no-cluster'}:${socket.agentId}`;

        void socket.join(metricsRoom);
      }

      this.logger.log(`✅ Client connected: agentId=${agentId}, clusterId=${clusterId}`);

      socket.on('disconnect', (reason) => {
        this.logger.log(`⚡ Client disconnected: agentId=${socket.agentId}, reason=${reason}`);
      });
    });
  }

  // Dynamic event listener for metrics
  @SubscribeMessage('metrics')
  handleMetrics(
    @MessageBody() payload: EventMetricsResponse,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.logger.log(`📩 Metrics received from agentId=${socket.agentId}:`, payload);

    const metricsRoom = `metrics:${socket.clusterId ?? 'no-cluster'}:${socket.agentId}`;

    this.server.to(metricsRoom).emit('metrics', payload);
  }
}
