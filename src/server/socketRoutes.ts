import { Server as ServerSocket } from 'socket.io';
import messageHandler from '../modules/messages/message.handler';
import userHandler from '../modules/users/user.handler';

export default function socketRoutes(socketServer: ServerSocket) {
  messageHandler(socketServer);
  userHandler(socketServer);
}
