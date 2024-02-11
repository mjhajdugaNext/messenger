import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import * as messageService from '../src/modules/messages/message.service';
import { functionalTestSetup } from './setup';
import * as testHelpers from './testHelpers';
import { type Socket as ClientSocket } from 'socket.io-client';
import { IUser, PartialUser } from '../src/modules/users/user.interface';

const { SERVER_PORT } = functionalTestSetup();

let clientSocketAuthorized: ClientSocket;
let clientSocketAuthorized2: ClientSocket;
let _user: PartialUser;
let _user2: PartialUser;

const user1Data: IUser = {
  username: 'mjhajduga',
  email: 'mjhajduga@next.com',
  password: 'password',
};

const user2Data: IUser = {
  username: 'mjhajduga2',
  email: 'mjhajduga@next2.com',
  password: 'password',
};

const user3Data: IUser = {
  username: 'mjhajduga3',
  email: 'mjhajduga@next3.com',
  password: 'password',
};

const asyncTimeout = (timeout: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('');
    }, timeout);
  });

describe('messages/add', () => {
  beforeEach(async () => {
    const { clientSocket, user } = await testHelpers.getAuthorizedClientSocket(SERVER_PORT, '/messages', user1Data);
    const { clientSocket: clientSocket2, user: user2 } = await testHelpers.getAuthorizedClientSocket(
      SERVER_PORT,
      '/messages',
      user2Data
    );

    clientSocketAuthorized = clientSocket;
    _user = user;
    clientSocketAuthorized2 = clientSocket2;
    _user2 = user2;
  });

  afterEach(() => {
    clientSocketAuthorized?.disconnect();
    clientSocketAuthorized2?.disconnect();
  });

  test('User can send message, and message is received by sender and receiver', async () => {
    const expectedResult: any = {
      sender: expect.any(String),
      receiver: expect.any(String),
      content: 'Some conent',
      type: 'text',
      dateCreated: expect.any(Number),
      dateReceived: null,
      dateRead: null,
      archived: false,
      _id: expect.any(String),
    };

    const messageToSend = {
      sender: _user2._id,
      receiver: _user._id,
      content: 'Some conent',
      type: 'text',
    };

    clientSocketAuthorized2.on('/message/created', (dataReceived) => {
      expect(dataReceived).toMatchObject(expectedResult);
    });

    clientSocketAuthorized.on(`/message/created`, (dataReceived) => {
      expect(dataReceived).toMatchObject(expectedResult);
    });

    clientSocketAuthorized2.emit('/message/create', messageToSend);

    await Promise.all([
      testHelpers.waitForSocketIOEvent(clientSocketAuthorized, '/message/created'),
      testHelpers.waitForSocketIOEvent(clientSocketAuthorized2, '/message/created'),
    ]);

    const messages = await messageService.getMessages();

    expect(messages).toHaveLength(1);
    expect(messages).toEqual(expect.arrayContaining([expect.objectContaining(expectedResult)]));
  });

  test('Nobody beside sender and reciver can receive a message', async () => {
    const { clientSocket: clientSocket3, user: user3 } = await testHelpers.getAuthorizedClientSocket(
      SERVER_PORT,
      '/messages',
      user3Data
    );

    clientSocket3.on('/message/created', () => {
      throw new Error('Message received by user not involved in conversation');
    });

    const messageToSend = {
      sender: _user2._id,
      receiver: _user._id,
      content: user3._id,
      type: 'text',
    };

    clientSocketAuthorized2.emit('/message/create', messageToSend);

    await Promise.all([
      testHelpers.waitForSocketIOEvent(clientSocketAuthorized2, '/message/created'),
      testHelpers.waitForSocketIOEvent(clientSocketAuthorized, '/message/created'),
      asyncTimeout(50),
    ]);

    clientSocket3.disconnect();
  });

});
