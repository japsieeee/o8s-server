/* eslint-disable @typescript-eslint/no-explicit-any */
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
      this.logger.log(`⚡ Client connected`);

      // both client user types (browser and agent) must provide a valid wsToken
      const wsToken = socket.handshake.auth['wsToken'] as string;

      // socket client authentication from agent
      const agentId = socket.handshake.auth['agentId'] as string;
      const clusterId = socket.handshake.auth['clusterId'] as string;

      // socket client authentication from browser
      const browserClientId = socket.handshake.auth['browserClientId'] as string;

      if (!this.guard.canActivate(wsToken)) {
        this.logger.warn(`Unauthorized connection attempt with token: ${wsToken}`);
        socket.disconnect(true);
        return;
      }

      if (!socket.browserInformation) {
        socket.browserInformation = {};
      }

      if (!socket.agentInformation) {
        socket.agentInformation = {};
      }

      if (browserClientId) {
        socket.isBrowser = true;
        socket.browserInformation.id = browserClientId;
      }

      if (agentId) {
        socket.isAgent = true;
        socket.agentInformation.id = agentId;
      }

      if (clusterId) {
        socket.agentInformation.clusterId = clusterId;
      }

      socket.on('disconnect', (reason) => {
        this.logger.log(`⚡ Client disconnected: reason=${reason}`);
      });
    });
  }

  @SubscribeMessage('metrics')
  handleMetrics(
    @MessageBody() payload: EventMetricsResponse,
    @ConnectedSocket() socket: Socket,
  ): void {
    const metricsRoom = `metrics:${socket.agentInformation.clusterId}:${socket.agentInformation.id}`;

    this.server.emit(metricsRoom, payload);
  }

  @SubscribeMessage('reboot')
  handleReboot(@MessageBody() payload: { clusterId: string; agentId: string }): void {
    const metricsRoom = `reboot:${payload.clusterId}:${payload.agentId}`;

    this.server.emit(metricsRoom, payload);
  }

  @SubscribeMessage('pm2-action')
  handlePM2Action(
    @MessageBody()
    payload: {
      clusterId: string;
      agentId: string;
      action: string;
      serviceName: string;
    },
  ): void {
    const metricsRoom = `pm2-action:${payload.clusterId}:${payload.agentId}`;

    this.server.emit(metricsRoom, payload);
  }

  @SubscribeMessage('pm2-action-result')
  handlePM2ActionResult(
    @MessageBody()
    payload: {
      clusterId: string;
      agentId: string;
      action: string;
      serviceName: string;
      timestamp: string;
      success: boolean;
      error: any;
    },
  ): void {
    const metricsRoom = `pm2-action-result:${payload.clusterId}:${payload.agentId}`;

    this.logger.log('metrics room', metricsRoom);

    this.server.emit(metricsRoom, payload);
  }
}
