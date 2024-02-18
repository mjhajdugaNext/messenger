import { IMessage } from './message.interface';
import * as messageService from './message.service';
import { type Socket, Namespace, type Server as ServerSocket } from 'socket.io';
import { socketAuthenticate } from '../../server/socketMiddlewares';

export default (socketServer: ServerSocket) => {
  const messageNamespace = socketServer.of('/messages');

  messageNamespace.use(socketAuthenticate);

  messageNamespace.on('connection', (socket: Socket) => {
    const userId: string = socket.data._id;
    socket.join(userId);

    socket.on('/message/create', addMessageHandler(socket, messageNamespace));
  });

  messageNamespace.on('disconnect', () => {
    console.log('disconnection');
  });
}

const addMessageHandler = (socket: Socket, namespace: Namespace) => async (message: IMessage) => {
  const savedMessage = await messageService.createMessage(message);

  const userId: string = socket.data._id;
  namespace.to(userId).emit('/message/created', savedMessage); // emit to sender
  namespace.to(savedMessage.receiver).emit('/message/created', savedMessage); // emit to receiver
};

