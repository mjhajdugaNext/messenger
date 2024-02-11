import { beforeAll, describe, test, expect, afterAll } from '@jest/globals';
import { functionalTestSetup } from './setup';
import * as testHelpers from './testHelpers';
import { type Socket as ClientSocket } from 'socket.io-client';

const { SERVER_PORT } = functionalTestSetup();

let clientSocket: ClientSocket;

describe('messages/add authorization', () => {
  beforeAll(async () => {
    clientSocket = await testHelpers.getClientSocket(SERVER_PORT, '/messages');
  });

  afterAll(() => {
    clientSocket?.disconnect();
  });

  test('Cannot add message because lack of authorization token', async () => {
    const messageToSend = {
      sender: '12234',
      receiver: 'asd',
      content: 'Some conent',
      type: 'text',
    };

    clientSocket.emit('message/create', messageToSend);

    clientSocket.on('connect_error', (dataReceived) => {
      expect(dataReceived.message).toEqual('Failed to decode or validate authorization token. Reason: invalid-token.');
    });

    return testHelpers.waitForSocketIOEvent(clientSocket, 'connect_error');
  });
});

