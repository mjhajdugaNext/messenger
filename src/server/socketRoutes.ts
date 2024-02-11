import { type Socket, Server as ServerSocket } from 'socket.io';
import * as messageHandlers from '../modules/messages/message.handler';
import { socketAuthenticate } from './socketMiddlewares';

export default function socketRoutes(socketServer: ServerSocket) {
  const orderNamespace = socketServer.of('/messages');

  orderNamespace.use(socketAuthenticate);

  orderNamespace.on('connection', (socket: Socket) => {
    const userId: string = socket.data._id;
    socket.join(userId);

    socket.on('/message/create', messageHandlers.addMessageHandler(socket, orderNamespace));
  });

  orderNamespace.on("disconnect", () => {
    console.log('disconnection');
  });
}
