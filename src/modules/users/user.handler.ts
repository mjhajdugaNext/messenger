import { omit } from 'ramda';
import { PUBLIC_USER_DATA_TO_OMIT, PartialUser } from './user.interface';
import * as userService from './user.service';
import { type Socket, Namespace, type Server as ServerSocket } from 'socket.io';
import { socketAuthenticate } from '../../server/socketMiddlewares';

export default (socketServer: ServerSocket) => {
    const userNamespace = socketServer.of('/users');

    userNamespace.use(socketAuthenticate);
  
    userNamespace.on('connection', (socket: Socket) => {
      const userId: string = socket.data._id;
      socket.join(userId);
      // make user active
      userService.updateUserById(userId, { active: true });
  
      socket.on('/friendsList', friendsList(socket, userNamespace));
  
      socket.on('/friendAdd', addFriends(socket, userNamespace));
  
      socket.on('/friendAccept', acceptFriends(socket, userNamespace));
    });
  
    userNamespace.on('disconnect', (socket: Socket) => {
      const userId: string = socket.data._id;
      console.log('disconnection');
      // make user active
      userService.updateUserById(userId, { active: false });
    });
}

// returns list of users that are friends
const friendsList = (socket: Socket, namespace: Namespace) => async () => {
  const userId: string = socket.data._id;
  const users = await userService.getFriends(userId);

  namespace.to(userId).emit('/friendsList', users);
};

const addFriends = (socket: Socket, namespace: Namespace) => async (friends: string[]) => {
  const userId: string = socket.data._id;

  console.log('friends', friends)
  const { updatedUser, updatedFriends } = await userService.addFriends(userId, friends);

  // emit to friends that have user in waitingRoom
  for (const friend of updatedFriends) {
    namespace.to(friend._id).emit('/friendAddedToWaitingRoom', omit(PUBLIC_USER_DATA_TO_OMIT, updatedUser));
  }

  // emit user
  namespace.to(userId).emit('/friendInvitationSended', updatedUser);
};

const acceptFriends = (socket: Socket, namespace: Namespace) => async (friends: string[]) => {
  const userId: string = socket.data._id;

  const { updatedUser, updatedFriends } = await userService.acceptFriends(userId, friends);

  //emit to friends that was accepted
  for (const friend of updatedFriends) {
    namespace.to(friend._id).emit('/friendInvitationAccepted', omit(PUBLIC_USER_DATA_TO_OMIT, updatedUser));
  }

  // emit user
  namespace.to(userId).emit('/friendAdded', updatedUser);
};
