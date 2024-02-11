import { beforeAll, beforeEach, describe, expect, test } from '@jest/globals';
import * as userService from '../src/modules/users/user.service';
import { integrationTestSetup } from './setup';
import { PartialUser, User, UserToSave } from '../src/modules/users/user.interface';
import { updateUserById, getUserByEmail, deleteUserById } from '../src/modules/users/user.service';

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
      },
    ]);

    expect(savedUser).toEqual({
      __v: expect.any(Number),
      _id: expect.any(String),
      username: userData.username,
      email: userData.email,
      active: false,
      lastActive: null,
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
    });
  });

  test('updates password', async () => {
    const userData = {
      password: 'password2',
    };

    const userBeforeUpdate: User = await userService.getUserByEmail(user.email);
    const updatedUser: PartialUser = await userService.updateUserById(user._id, userData);
    const updatedUserFromDb = await userService.getUserByEmail(user.email);

    expect(updatedUser).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: user.username,
      email: user.email,
      active: false,
      lastActive: null,
    });

    expect(updatedUserFromDb).toEqual({
      __v: expect.any(Number),
      _id: user._id,
      username: user.username,
      password: expect.any(String),
      email: user.email,
      active: false,
      lastActive: null,
    });

    expect(updatedUserFromDb.password).not.toEqual(userData.password); // expect data to be hashed
    expect(userBeforeUpdate.password).not.toEqual(updatedUserFromDb.password); // expect hash to be different than before update
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
    });
  });

  test('throws an error when invalid object passed to update', async () => {
    const userData = {};

    await expect(userService.updateUserById(user._id, userData)).rejects.toThrow('"value" must have at least 1 key');
  });
});

describe('deleteuserById', () => {
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
    });

    const usersInDb = await userService.getUsers();

    expect(usersInDb).toEqual([]);
  });
});
