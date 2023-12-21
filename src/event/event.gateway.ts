import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth';
import { JWTService } from 'src/configs';
import { Conversation, Message, MessageType } from 'src/entities';
import { ConnectedService } from 'src/modules/connected/connected.service';
import { ConversationService } from 'src/modules/conversation/conversation.service';
import { JoinedConversationService } from 'src/modules/joined-conversation/joined-conversation.service';
import { MessagesService } from 'src/modules/messages/messages.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8081'],
  },
})
export class EventGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private authService: AuthService,
    private conversationService: ConversationService,
    private connectedService: ConnectedService,
    private jwtService: JWTService,
    private messageService: MessagesService,
    private joinedService: JoinedConversationService
  ) {}

  async onModuleInit() {
    console.log('init');
    await this.connectedService.deleteAllConnected();
    await this.joinedService.deleteAll();
  }

  async handleConnection(socket: Socket) {
    console.log('connect');
    console.log(socket.id);
    try {
      const token = socket.handshake?.headers?.authorization;
      console.log(token);
      if (!token) {
        return this.disconnect(socket);
      }
      const user = await this.getDataUserFromToken(socket);
      if (user instanceof UnauthorizedException) {
        return this.disconnect(socket);
      }
      socket.data.user = user;
      await this.authService.handleOnline(user.uuid);
      const conversations =
        await this.conversationService.getAllConversationOfUser(user.uuid);
      //console.log(conversation);

      await this.connectedService.createConnected({
        user_uuid: user.uuid,
        socket_id: socket.id,
      });
      return this.server.to(socket.id).emit('conversations', conversations);
    } catch (error) {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket) {
    await this.authService.handleOffline(socket.data?.user?.uuid).catch(() => {
      return this.disconnect(socket);
    });
    await this.connectedService
      .deleteConnectedBySocketId(socket.id)
      .catch(() => {
        return this.disconnect(socket);
      });
    socket.disconnect();
  }

  private disconnect(socket: Socket) {
    this.server.to(socket.id).emit('error', {
      message: 'Unauthorized',
    });
    return socket.disconnect();
  }

  @SubscribeMessage('createConversation')
  async onCreateRoom(socket: Socket, conversation: Partial<Conversation>) {
    console.log('createConversation');
    const your_uuid = socket.data.user.uuid;

    const newConversation = await this.conversationService.createConversation(
      your_uuid,
      conversation.joined_uuid
    );

    //console.log(newConversation);
    // /////update list conversation of user
    await this.updateRoomOfUser(newConversation.user_uuid, newConversation);
    await this.updateRoomOfUser(newConversation.joined_uuid, newConversation);
  }

  @SubscribeMessage('joinConversation')
  async onJoinConversations(
    socket: Socket,
    conversation?: Partial<Conversation>
  ) {
    console.log('joinConversation');

    try {
      const user_uuid = socket.data.user.uuid;

      await this.messageService.updateSeenMessage(
        user_uuid,
        conversation?.last_message_uuid,
        conversation?.uuid
      );

      const messages = await this.messageService.findMessagesByConversation(
        conversation.uuid,
        conversation?.last_message_uuid
      );

      await this.joinedService.addJoinedToConversation(
        socket.id,
        user_uuid,
        conversation.uuid
      );
      console.log(socket.id);
      this.server.to(socket.id).emit('messages', messages);
    } catch (error) {
      console.log('error at join conversation: ', error.message);
      return this.disconnect(socket);
    }

    //const joined = await this.joinedService.addJoinedToConversation(socket.id);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(socket: Socket) {
    // remove connection from JoinedRooms
    console.log('leaveRoom');
    await this.updateRoomOfUserWhenLeave(socket.data.user.uuid);
    await this.joinedService.deleteBySocketId(socket.id);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(socket: Socket, message: Message) {
    const user_uuid = socket.data?.user?.uuid;
    let isOnline = false;
    //console.log(message);
    let newMessage: Message = await this.messageService.createMessage({
      conversation_uuid: message.conversation_uuid,
      message: message.message,
      user_uuid,
      type: message.type || MessageType.MESSAGE,
    });

    //console.log(createdMessage);
    const conversation: Conversation =
      await this.conversationService.getConversationByUuid(
        message.conversation_uuid,
        newMessage.uuid
      );

    const remaining_person =
      conversation.user_uuid === user_uuid
        ? conversation.joined_uuid
        : conversation.user_uuid;
    console.log('remaning person:', remaining_person);

    //console.log(conversation);

    const joinedUsers = await this.joinedService.getAllJoinedByConversation(
      conversation.uuid
    );

    //this.server.to(user.socketId).emit('messageAdd', createdMessage);
    //console.log(joinedUsers)
    for (const user of joinedUsers) {
      if (user.user_uuid === remaining_person) {
        newMessage.is_seen = true;
        isOnline = true;
        this.messageService.uppdateMessageStatusByUuid(newMessage.uuid);
      }
      this.server.to(user['socket_id']).emit('messageAdd', newMessage);
    }
  }

  async updateRoomOfUser(user_uuid: string, conversation?: Conversation) {
    const user_connection = await this.connectedService.findConnectedByUserUuid(
      user_uuid
    );
    if (!user_connection[0]?.socket_id) return;
    // add notification at here

    for (const connected of user_connection) {
      //console.log(connected.socket_id);
      //this.server.to(connected.socket_id).emit('conversations', conversations);
      this.server
        .to(connected?.socket_id)
        .emit('newConversation', conversation);
    }
  }

  async updateRoomOfUserWhenLeave(user_uuid: string) {
    const user_connection = await this.connectedService.findConnectedByUserUuid(
      user_uuid
    );
    if (!user_connection[0]?.socket_id) return;
    const conversations =
      await this.conversationService.getAllConversationOfUser(user_uuid);

    for (const connected of user_connection) {
      //console.log(connected.socket_id);
      //this.server.to(connected.socket_id).emit('conversations', conversations);
      this.server.to(connected?.socket_id).emit('conversations', conversations);
    }
  }

  async getDataUserFromToken(socket: Socket): Promise<any> {
    const token = socket.handshake?.headers?.authorization;
    try {
      const decoded = this.jwtService.verifyToken(token, 'access').catch(() => {
        this.disconnect(socket);
        return new UnauthorizedException();
      });

      return decoded;
    } catch (ex) {
      this.disconnect(socket);
    }
  }
}
