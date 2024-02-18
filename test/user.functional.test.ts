import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import { functionalTestSetup } from './setup';
import * as testHelpers from './testHelpers';
import { type Socket as ClientSocket } from 'socket.io-client';
import { IUser, PartialUser } from '../src/modules/users/user.interface';
import * as userService from '../src/modules/users/user.service';

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

describe('user sockets', () => {
  beforeEach(async () => {
    const { clientSocket, user } = await testHelpers.getAuthorizedClientSocket(SERVER_PORT, '/users', user1Data);
    const { clientSocket: clientSocket2, user: user2 } = await testHelpers.getAuthorizedClientSocket(
      SERVER_PORT,
      '/users',
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

  describe('/friendsList', () => {
    test('should emit back list of friends', async () => {
      await userService.addFriends(_user._id, [_user2._id]);
      await userService.acceptFriends(_user2._id, [_user._id]);

      clientSocketAuthorized.on(`/friendsList`, (dataReceived) => {
        expect(dataReceived).toEqual([
          {
            __v: expect.any(Number),
            _id: _user2._id,
            active: true,
            email: _user2.email,
            lastActive: null,
            username: _user2.username,
          },
        ]);
      });

      clientSocketAuthorized.emit('/friendsList');

      await testHelpers.waitForSocketIOEvent(clientSocketAuthorized, '/friendsList');
    });
  });

  describe('/friendAdd', () => {
    test('should add freind invitation and notify invited friends and user which send invitation', async () => {
      clientSocketAuthorized.on(`/friendInvitationSended`, (dataReceived) => {
        expect(dataReceived).toEqual({
          __v: expect.any(Number),
          _id: _user._id,
          active: true,
          email: _user.email,
          lastActive: null,
          username: _user.username,
          friends: [],
          friendsWaitingRoom: [],
          inSomeoneWaitingRoom: [_user2._id],
        });
      });

      clientSocketAuthorized2.on(`/friendAddedToWaitingRoom`, (dataReceived) => {
        expect(dataReceived).toEqual({
          __v: expect.any(Number),
          _id: _user._id,
          active: true,
          email: _user.email,
          lastActive: null,
          username: _user.username,
        });
      });
      clientSocketAuthorized.emit('/friendAdd', [_user2._id]);

      await Promise.all([
        testHelpers.waitForSocketIOEvent(clientSocketAuthorized, '/friendInvitationSended'),
        testHelpers.waitForSocketIOEvent(clientSocketAuthorized2, '/friendAddedToWaitingRoom'),
      ]);
    });
  });

  describe('/friendAccept', () => {
    test('should accept invitation and notify users', async () => {
      await userService.updateUserById(_user._id, { friendsWaitingRoom: [_user2._id] });
      await userService.updateUserById(_user2._id, { inSomeoneWaitingRoom: [_user._id] });

      clientSocketAuthorized2.on(`/friendInvitationAccepted`, (dataReceived) => {
        expect(dataReceived).toEqual({
          __v: expect.any(Number),
          _id: _user._id,
          active: true,
          email: _user.email,
          lastActive: null,
          username: _user.username,
        });
      });

      clientSocketAuthorized.on(`/friendAdded`, (dataReceived) => {
        expect(dataReceived).toEqual({
          __v: expect.any(Number),
          _id: _user._id,
          active: true,
          email: _user.email,
          lastActive: null,
          username: _user.username,
          friends: [_user2._id],
          friendsWaitingRoom: [],
          inSomeoneWaitingRoom: [],
        });
      });

      clientSocketAuthorized.emit('/friendAccept', [_user2._id]);

      await Promise.all([
        testHelpers.waitForSocketIOEvent(clientSocketAuthorized, '/friendAdded'),
        testHelpers.waitForSocketIOEvent(clientSocketAuthorized2, '/friendInvitationAccepted'),
      ]);
    });
  });
});
