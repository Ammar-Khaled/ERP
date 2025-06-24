import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, string[]>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove disconnected client from userSockets map
    for (const [userId, sockets] of this.userSockets.entries()) {
      const index = sockets.indexOf(client.id);
      if (index !== -1) {
        sockets.splice(index, 1);
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('registerUser')
  handleRegisterUser(client: Socket, userId: number) {
    if (!userId) return;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }

    const sockets = this.userSockets.get(userId);
    if (!sockets.includes(client.id)) {
      sockets.push(client.id);
    }

    console.log(`User ${userId} registered with socket ${client.id}`);
  }

  sendNotificationToUser(userId: number, notification: any) {
    const userSocketIds = this.userSockets.get(userId) || [];

    userSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('notification', notification);
    });
  }

  sendNotificationToAll(notification: any) {
    this.server.emit('notification', notification);
  }
}
