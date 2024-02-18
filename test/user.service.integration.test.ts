import { beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import * as userService from '../src/modules/users/user.service';
import { integrationTestSetup } from './setup';
import { PartialUser, User, UserToSave } from '../src/modules/users/user.interface';
import { acceptFriends } from '../src/modules/users/user.service';

integrationTestSetup();

describe('getUsers', () => {
  test('can return list of users', async () => {
    const users = await userService.getUsers();
    expect(users).toEqual([]);
  });
});

describe('getUserByEmail', () => {
  test('returns undefined when no user founded', async () => {
    const user = await userService.getUserByEmail('some email');
    expect(user).toBeUndefined();
  });

  test('returns user when exists in db', async () => {
    const userData = {
      email: 'email@email.com',
      username: 'mjhajduga',
      password: 'password',
    };
    await userService.createUser(userData);

    const user = await userService.getUserByEmail(userData.email);
    expect(user).toEqual({
      __v: expect.any(Number),
      _id: expect.any(String),
      username: userData.username,
      email: userData.email,
      password: expect.any(String),
      active: false,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });
  });
});

describe('getUserById', () => {
  test('returns user when exists in db', async () => {
    const userData = {
      email: 'email@email.com',
      username: 'mjhajduga',
      password: 'password',
    };
    const { _id } = await userService.createUser(userData);

    const user = await userService.getUserById(_id);
    expect(user).toEqual({
      __v: expect.any(Number),
      _id,
      username: userData.username,
      email: userData.email,
      active: false,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });
  });
});

describe('createUser', () => {
  test('creates and returns created user', async () => {
    const userData = {
      email: 'email@email.com',
      username: 'mjhajduga',
      password: 'password',
    };
    const savedUser = await userService.createUser(userData);
    const usersInDb = await userService.getUsers();

    expect(usersInDb).toEqual([
      {
        __v: expect.any(Number),
        _id: expect.any(String),
        username: userData.username,
        email: userData.email,
        active: false,
        lastActive: null,
        friends: [],
        friendsWaitingRoom: [],
        inSomeoneWaitingRoom: [],
      },
    ]);

    expect(savedUser).toEqual({
      __v: expect.any(Number),
      _id: expect.any(String),
      username: userData.username,
      email: userData.email,
      active: false,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });
  });

  test('throws an error when no email passed', async () => {
    const userData = {
      username: 'mjhajduga',
      password: 'password',
    };
    await expect(userService.createUser(userData)).rejects.toThrow('"email" is required');
  });

  test('throws an error when no username passed', async () => {
    const userData = {
      email: 'email@email.com',
      password: 'password',
    };
    await expect(userService.createUser(userData)).rejects.toThrow('"username" is required');
  });

  test('throws an error when no password passed', async () => {
    const userData = {
      email: 'email@email.com',
      username: 'mjhajduga',
    };
    await expect(userService.createUser(userData)).rejects.toThrow('"password" is required');
  });
});

describe('updateUserById', () => {
  let user: PartialUser;

  beforeEach(async () => {
    user = await userService.createUser({
      email: 'email@email.com',
      username: 'mjhajduga',
      password: 'password',
    });
  });

  test('updates email', async () => {
    const userData = {
      email: 'email2@email.com',
    };

    const updatedUser: PartialUser = await userService.updateUserById(user._id, userData);

    expect(updatedUser).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: user.username,
      email: userData.email,
      active: false,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });
  });

  test('updates username', async () => {
    const userData = {
      username: 'username2',
    };

    const updatedUser: PartialUser = await userService.updateUserById(user._id, userData);

    expect(updatedUser).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: userData.username,
      email: user.email,
      active: false,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });
  });

  test('updates password', async () => {
    const userData = {
      password: 'password2',
    };

    const userBeforeUpdate: User | undefined = await userService.getUserByEmail(user.email);
    const updatedUser: PartialUser = await userService.updateUserById(user._id, userData);
    const updatedUserFromDb = await userService.getUserByEmail(user.email);

    expect(updatedUser).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: user.username,
      email: user.email,
      active: false,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });

    expect(updatedUserFromDb).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: user.username,
      password: expect.any(String),
      email: user.email,
      active: false,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });

    expect(updatedUserFromDb?.password).not.toEqual(userData.password); // expect data to be hashed
    expect(userBeforeUpdate?.password).not.toEqual(updatedUserFromDb?.password); // expect hash to be different than before update
  });

  test('updates active', async () => {
    const userData = {
      active: true,
    };

    const updatedUser: PartialUser = await userService.updateUserById(user._id, userData);

    expect(updatedUser).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: user.username,
      email: user.email,
      active: userData.active,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });
  });

  test('updates lastActive', async () => {
    const userData = {
      lastActive: 123,
    };

    const updatedUser: PartialUser = await userService.updateUserById(user._id, userData);

    expect(updatedUser).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: user.username,
      email: user.email,
      active: user.active,
      lastActive: userData.lastActive,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });
  });

  test('updates friends', async () => {
    const userData = {
      friends: ['id1', 'id2'],
    };

    const updatedUser: PartialUser = await userService.updateUserById(user._id, userData);

    expect(updatedUser).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: user.username,
      email: user.email,
      active: user.active,
      lastActive: user.lastActive,
      friends: userData.friends,
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });
  });

  test('throws an error when invalid object passed to update', async () => {
    const userData = {};

    await expect(userService.updateUserById(user._id, userData)).rejects.toThrow('"value" must have at least 1 key');
  });
});

describe('deleteUserById', () => {
  test('deletes user', async () => {
    const userData = {
      email: 'email@email.com',
      username: 'mjhajduga',
      password: 'password',
    };
    const { _id } = await userService.createUser(userData);

    const user = await userService.deleteUserById(_id);

    expect(user).toEqual({
      __v: expect.any(Number),
      _id,
      username: userData.username,
      email: userData.email,
      active: false,
      lastActive: null,
      friends: [],
      friendsWaitingRoom: [],
      inSomeoneWaitingRoom: [],
    });

    const usersInDb = await userService.getUsers();

    expect(usersInDb).toEqual([]);
  });
});

describe('friends update methods', () => {
  let friend1: PartialUser;
  let friend2: PartialUser;
  let friend3: PartialUser;

  beforeEach(async () => {
    friend1 = await userService.createUser({
      email: 'email@email1.com',
      username: 'mjhajduga1',
      password: 'password',
    });

    friend2 = await userService.createUser({
      email: 'email@email2.com',
      username: 'mjhajduga2',
      password: 'password',
    });

    friend3 = await userService.createUser({
      email: 'email@email3.com',
      username: 'mjhajduga3',
      password: 'password',
    });
  });

  describe('addFriends', () => {
    test('adds new friends', async () => {
      const createdUser = await userService.createUser({
        email: 'email@email.com',
        username: 'mjhajduga',
        password: 'password',
      });

      const { updatedUser, updatedFriends } = await userService.addFriends(createdUser._id, [friend1._id]);

      expect(updatedUser).toEqual({
        __v: expect.any(Number),
        _id: createdUser._id,
        username: createdUser.username,
        email: createdUser.email,
        active: false,
        lastActive: null,
        friends: [],
        friendsWaitingRoom: [],
        inSomeoneWaitingRoom: [friend1._id],
      });

      expect(updatedFriends).toEqual([
        {
          __v: expect.any(Number),
          _id: friend1._id,
          username: friend1.username,
          email: friend1.email,
          active: false,
          lastActive: null,
          friends: [],
          friendsWaitingRoom: [createdUser._id],
          inSomeoneWaitingRoom: [],
        },
      ]);

      const usersInDb = await userService.getUsers();

      expect(usersInDb).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            __v: expect.any(Number),
            _id: createdUser._id,
            username: createdUser.username,
            email: createdUser.email,
            active: false,
            lastActive: null,
            friends: [],
            friendsWaitingRoom: [],
            inSomeoneWaitingRoom: [friend1._id],
          }),
          expect.objectContaining({
            __v: expect.any(Number),
            _id: friend1._id,
            username: friend1.username,
            email: friend1.email,
            active: false,
            lastActive: null,
            friends: [],
            friendsWaitingRoom: [createdUser._id],
            inSomeoneWaitingRoom: [],
          }),
          expect.objectContaining({
            __v: expect.any(Number),
            _id: friend2._id,
            username: friend2.username,
            email: friend2.email,
            active: false,
            lastActive: null,
            friends: [],
            friendsWaitingRoom: [],
            inSomeoneWaitingRoom: [],
          }),
        ])
      );
    });

    test('do not add new friend when friend us already in friends list', async () => {
      const createdUser = await userService.createUser({
        email: 'email@email.com',
        username: 'mjhajduga',
        password: 'password',
        inSomeoneWaitingRoom: [friend1._id],
      });

      await userService.updateUserById(friend1._id, { friendsWaitingRoom: [createdUser._id] })

      const { updatedUser, updatedFriends } =  await userService.addFriends(createdUser._id, [friend1._id]);

      expect(updatedUser).toEqual({
        __v: expect.any(Number),
        _id: createdUser._id,
        username: createdUser.username,
        email: createdUser.email,
        active: false,
        lastActive: null,
        friends: [],
        friendsWaitingRoom: [],
        inSomeoneWaitingRoom: [friend1._id],
      });

      expect(updatedFriends).toEqual([
        {
          __v: expect.any(Number),
          _id: friend1._id,
          username: friend1.username,
          email: friend1.email,
          active: false,
          lastActive: null,
          friends: [],
          friendsWaitingRoom: [createdUser._id],
          inSomeoneWaitingRoom: [],
        },
      ]);

      const usersInDb = await userService.getUsers();

      expect(usersInDb).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            __v: expect.any(Number),
            _id: createdUser._id,
            username: createdUser.username,
            email: createdUser.email,
            active: false,
            lastActive: null,
            friends: [],
            friendsWaitingRoom: [],
            inSomeoneWaitingRoom: [friend1._id],
          }),
          expect.objectContaining({
            __v: expect.any(Number),
            _id: friend1._id,
            username: friend1.username,
            email: friend1.email,
            active: false,
            lastActive: null,
            friends: [],
            friendsWaitingRoom: [createdUser._id],
            inSomeoneWaitingRoom: []
          }),
        ])
      );
    });

    test('thows an error when freind id is not associated with exiting user', async () => {
      const createdUser = await userService.createUser({
        email: 'email@email.com',
        username: 'mjhajduga',
        password: 'password',
        friendsWaitingRoom: [friend1._id],
      });

      await expect(userService.addFriends(createdUser._id, ['id_1'])).rejects.toThrow(
        'One of passed friends is not an user'
      );
    });
  });

  describe('acceptFriends', () => {
    test('accepts friends', async () => {
      const createdUser = await userService.createUser({
        email: 'email@email.com',
        username: 'mjhajduga',
        password: 'password',
        friends: [],
        friendsWaitingRoom: [friend1._id, friend2._id, friend3._id],
      });

      await userService.updateUserById(friend1._id, { inSomeoneWaitingRoom: [createdUser._id] });
      await userService.updateUserById(friend2._id, { inSomeoneWaitingRoom: [createdUser._id] });

      const { updatedUser, updatedFriends } = await userService.acceptFriends(createdUser._id, [friend1._id, friend2._id]);

      expect(updatedUser).toEqual({
        __v: expect.any(Number),
        _id: createdUser._id,
        username: createdUser.username,
        email: createdUser.email,
        active: false,
        lastActive: null,
        friends: [friend1._id, friend2._id],
        friendsWaitingRoom: [friend3._id],
        inSomeoneWaitingRoom: [],
      });

      expect(updatedFriends).toEqual([
        {
          __v: expect.any(Number),
          _id: friend1._id,
          username: friend1.username,
          email: friend1.email,
          active: false,
          lastActive: null,
          friends: [createdUser._id],
          friendsWaitingRoom: [],
          inSomeoneWaitingRoom: [],
        },
        {
          __v: expect.any(Number),
          _id: friend2._id,
          username: friend2.username,
          email: friend2.email,
          active: false,
          lastActive: null,
          friends: [createdUser._id],
          friendsWaitingRoom: [],
          inSomeoneWaitingRoom: [],
        }
      ])

      const usersInDb = await userService.getUsers();

      expect(usersInDb).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            __v: expect.any(Number),
            _id: createdUser._id,
            username: createdUser.username,
            email: createdUser.email,
            active: false,
            lastActive: null,
            friends: [friend1._id, friend2._id],
            friendsWaitingRoom: [friend3._id],
            inSomeoneWaitingRoom: [],
          }),
          expect.objectContaining({
            __v: expect.any(Number),
            _id: friend1._id,
            username: friend1.username,
            email: friend1.email,
            active: false,
            lastActive: null,
            friends: [createdUser._id],
            friendsWaitingRoom: [],
            inSomeoneWaitingRoom: [],
          }),
          expect.objectContaining({
            __v: expect.any(Number),
            _id: friend2._id,
            username: friend2.username,
            email: friend2.email,
            active: false,
            lastActive: null,
            friends: [createdUser._id],
            friendsWaitingRoom: [],
            inSomeoneWaitingRoom: [],
          }),
        ])
      );
    });
  });

  describe('removeFriends', () => {
    test('removes friends', async () => {
      const createdUser = await userService.createUser({
        email: 'email@email.com',
        username: 'mjhajduga',
        password: 'password',
        friends: [friend1._id, friend2._id, friend3._id],
      });

      await userService.updateUserById(friend1._id, { friends: [createdUser._id] });
      await userService.updateUserById(friend2._id, { friends: [createdUser._id] });

      const { updatedUser, updatedFriends } = await userService.removeFriends(createdUser._id, [friend1._id, friend2._id]);

      expect(updatedUser).toEqual({
        __v: expect.any(Number),
        _id: createdUser._id,
        username: createdUser.username,
        email: createdUser.email,
        active: false,
        lastActive: null,
        friends: [friend3._id],
        friendsWaitingRoom: [],
        inSomeoneWaitingRoom: [],
      });

      expect(updatedFriends).toEqual([
        {
          __v: expect.any(Number),
          _id: friend1._id,
          username: friend1.username,
          email: friend1.email,
          active: false,
          lastActive: null,
          friends: [],
          friendsWaitingRoom: [],
          inSomeoneWaitingRoom: [],
        },
        {
          __v: expect.any(Number),
          _id: friend2._id,
          username: friend2.username,
          email: friend2.email,
          active: false,
          lastActive: null,
          friends: [],
          friendsWaitingRoom: [],
          inSomeoneWaitingRoom: [],
        }
      ])

      const usersInDb = await userService.getUsers();

      expect(usersInDb).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            __v: expect.any(Number),
            _id: createdUser._id,
            username: createdUser.username,
            email: createdUser.email,
            active: false,
            lastActive: null,
            friends: [friend3._id],
            friendsWaitingRoom: [],
            inSomeoneWaitingRoom: [],
          }),
          expect.objectContaining({
            __v: expect.any(Number),
            _id: friend1._id,
            username: friend1.username,
            email: friend1.email,
            active: false,
            lastActive: null,
            friends: [],
            friendsWaitingRoom: [],
            inSomeoneWaitingRoom: [],
          }),
          expect.objectContaining({
            __v: expect.any(Number),
            _id: friend2._id,
            username: friend2.username,
            email: friend2.email,
            active: false,
            lastActive: null,
            friends: [],
            friendsWaitingRoom: [],
            inSomeoneWaitingRoom: [],
          }),
        ])
      );
    });
  });
});

describe('getActiveFriends', () => {
  test('gets active friends', async () => {
    const friend1 = await userService.createUser({
      email: 'email@email1.com',
      username: 'mjhajduga1',
      password: 'password',
      friends: [],
      active: true,
    });
    const friend2 = await userService.createUser({
      email: 'email@email2.com',
      username: 'mjhajduga2',
      password: 'password',
      friends: [],
      active: false,
    });

    await userService.createUser({
      email: 'email@email3.com',
      username: 'mjhajduga3',
      password: 'password',
      friends: [],
      active: true,
    });

    const createdUser = await userService.createUser({
      email: 'email@email.com',
      username: 'mjhajduga',
      password: 'password',
      friends: [friend1._id, friend2._id],
    });

    const activeFriends = await userService.getActiveFriends(createdUser._id);

    expect(activeFriends).toEqual([
      {
        _id: friend1._id,
        username: friend1.username,
        email: friend1.email,
        lastActive: null,
        active: true,
        __v: expect.any(Number),
      },
    ]);
  });
});

describe('getFriends', () => {
  test('gets friends without users that are not friends', async () => {
    const friend1 = await userService.createUser({
      email: 'email@email1.com',
      username: 'mjhajduga1',
      password: 'password',
      friends: [],
      active: true,
    });
    const friend2 = await userService.createUser({
      email: 'email@email2.com',
      username: 'mjhajduga2',
      password: 'password',
      friends: [],
      active: false,
    });

    await userService.createUser({
      email: 'email@email3.com',
      username: 'mjhajduga3',
      password: 'password',
      friends: [],
      active: true,
    });

    const createdUser = await userService.createUser({
      email: 'email@email.com',
      username: 'mjhajduga',
      password: 'password',
      friends: [friend1._id, friend2._id],
    });

    const friends = await userService.getFriends(createdUser._id);

    expect(friends).toEqual([
      {
        _id: friend1._id,
        username: friend1.username,
        email: friend1.email,
        lastActive: null,
        active: true,
        __v: expect.any(Number),
      },
      {
        _id: friend2._id,
        username: friend2.username,
        email: friend2.email,
        lastActive: null,
        active: false,
        __v: expect.any(Number),
      },
    ]);
  });
});
