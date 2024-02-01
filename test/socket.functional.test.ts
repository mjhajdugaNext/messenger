import { beforeAll, describe, test, expect } from '@jest/globals';
import { type Socket as ServerSocket } from 'socket.io';
import { functionalTestSetup } from './setup';
import * as testHelpers from './testHelpers';

const { socketIOServer, clientSocket } = functionalTestSetup();

let serverSocket: ServerSocket;

describe('Socket io server', () => {
  beforeAll(async () => {
    serverSocket = await testHelpers.getSocket(socketIOServer);
  });

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
