import { IMessage } from './message.interface';
import * as messageService from './message.service';
import { type Socket, Namespace } from 'socket.io';

export const addMessageHandler = (socket: Socket, namespace: Namespace) => async (message: IMessage) => {
  const savedMessage = await messageService.createMessage(message);

  const userId: string = socket.data._id;
  namespace.to(userId).emit('/message/created', savedMessage); // emit to sender
  namespace.to(savedMessage.receiver).emit('/message/created', savedMessage); // emit to receiver
};
