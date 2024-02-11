import { beforeAll, describe, test, expect, afterAll } from '@jest/globals';
import { type Socket as ServerSocket } from 'socket.io';
import { functionalTestSetup } from './setup';
import * as testHelpers from './testHelpers';
import { Socket as ClientSocket } from 'socket.io-client';

const { socketIOServer, SERVER_PORT } = functionalTestSetup();

let serverSocket: ServerSocket;
let clientSocket: ClientSocket;

describe('Socket io server', () => {
  beforeAll(async () => {
    clientSocket = await testHelpers.getClientSocket(SERVER_PORT, '')
    serverSocket = await testHelpers.getServerSocket(socketIOServer);
  });

  afterAll(() => {
    clientSocket.disconnect()
  })

  test('can emit data to client socket', async () => {
    const dataToSend = 'worktest';

    clientSocket.on('worktest', (data) => {
      expect(data).toEqual(dataToSend);
    });

    serverSocket.emit('worktest', dataToSend);

    return testHelpers.waitForSocketIOEvent(clientSocket, 'worktest');
  });

  test('can receive data from client socket', async () => {
    const dataToSend = 'worktest';

    serverSocket.on('worktest', (data) => {
      expect(data).toEqual(dataToSend);
    });

    clientSocket.emit('worktest', dataToSend);

    return testHelpers.waitForSocketIOEvent(serverSocket, 'worktest');
  });
});
