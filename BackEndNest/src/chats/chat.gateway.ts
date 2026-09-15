import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { SendChatMessagesDto } from './dto/send-chat-messages.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://zelon-gathering.vercel.app'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(private readonly chatsService: ChatsService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
    return { event: 'joined_room', roomId: data.roomId };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    return { event: 'left_room', roomId: data.roomId };
  }

  @SubscribeMessage('send_private_message')
  async handleSendPrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { roomId: string; senderId: string; dto: SendChatMessagesDto },
  ) {
    const { roomId, senderId, dto } = payload;

    const message = await this.chatsService.savePrivateMessage(
      roomId,
      senderId,
      dto,
    );

    this.server.to(roomId).emit('new_private_message', message);

    return message;
  }
}
