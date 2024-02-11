import { type Socket as ServerSocket, Server as SocketIOServer } from 'socket.io';
import { type Socket as ClientSocket, io as ioc } from 'socket.io-client';
import * as userService from '../src/modules/users/user.service';
import { EncodeResult, IUser, IUserLogin, PartialUser } from '../src/modules/users/user.interface';

// this needs to be axecuted after client socket will connect, otherwise promise will never rosolve
export function getServerSocket(socketIOServer: SocketIOServer): Promise<ServerSocket> {
  return new Promise((resolve) => {
    socketIOServer.on('connection', resolve);
  });
}

export function waitForSocketIOEvent(socket: ServerSocket | ClientSocket, event: string): Promise<any> {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

const defaultUserData = {
  username: 'mjhajduga',
  email: 'mjhajduga@next.com',
  password: 'password',
};

export async function createUserAndLogIn(
  user: IUser = defaultUserData
): Promise<{ encodeResult: EncodeResult; user: PartialUser }> {
  const savedUser = await userService.register(user);

  const loginData: IUserLogin = {
    email: user.email || '',
    password: user.password || ''
  }
  const encodeResult: EncodeResult = await userService.login(loginData);
  return { encodeResult, user: savedUser };
}

export async function getAuthorizedClientSocket(
  serverPort: number,
  namespace: string,
  user?: IUser
): Promise<{ clientSocket: ClientSocket; user: PartialUser }> {
  const {
    encodeResult: { token },
    user: _user,
  } = await createUserAndLogIn(user);
  const clientSocket: ClientSocket = ioc(`http://localhost:${serverPort}${namespace}`, { auth: { token } });
  await waitForSocketIOEvent(clientSocket, 'connect');
  return { clientSocket, user: _user };
}

export async function getClientSocket(
  serverPort: number,
  namespace: string,
  waitForConnection: boolean = false
): Promise<ClientSocket> {
  const clientSocket: ClientSocket = ioc(`http://localhost:${serverPort}${namespace}`, { auth: { token: '' } });
  if (waitForConnection) {
    await waitForSocketIOEvent(clientSocket, 'connect');
  }
  return clientSocket;
}
