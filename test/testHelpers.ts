import { type Socket as ServerSocket, Server as SocketIOServer } from 'socket.io';
import { type Socket as ClientSocket } from 'socket.io-client';

export function getSocket(socketIOServer: SocketIOServer): Promise<ServerSocket> {
  return new Promise((resolve) => {
    socketIOServer.on('connection', resolve);
  });
}

export function waitForSocketIOEvent(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}
