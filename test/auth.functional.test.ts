import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { functionalTestSetup } from './setup';
import * as userService from '../src/modules/users/user.service';

const { app } = functionalTestSetup();

describe('Authentication routes', () => {
  describe('register POST', () => {
    test('Registers user', async () => {
      const userData = {
        email: 'mjhajduga1@gmail.com',
        username: 'mjhajduga',
        password: 'password',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        email: 'mjhajduga1@gmail.com',
        username: 'mjhajduga',
        _id: expect.any(String),
      });
    });

    test('Not allow to create user with email that already exist in db', async () => {
      const userData = {
        email: 'mjhajduga1@gmail.com',
        username: 'mjhajduga',
        password: 'password',
      };

      await userService.createUser(userData);

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({
        message: 'User already exist',
      });
    });

    test('Not allow to create user without email', async () => {
      const userData = {
        username: 'mjhajduga',
        password: 'password',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        message: '"email" is required',
      });
    });

    test('Not allow to create user without username', async () => {
      const userData = {
        email: 'mjhajduga1@gmail.com',
        password: 'password',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        message: '"username" is required',
      });
    });

    test('Not allow to create user without password', async () => {
      const userData = {
        email: 'mjhajduga1@gmail.com',
        username: 'mjhajduga',
      };

      const response = await request(app).post('/auth/register').send(userData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        message: '"password" is required',
      });
    });
  });

  describe('login POST', () => {
    test('returns auth data after sending correct credentials', async () => {
      const userData = {
        email: 'mjhajduga1@gmail.com',
        username: 'mjhajduga',
        password: 'password',
      };

      const loginData = {
        email: 'mjhajduga1@gmail.com',
        password: 'password',
      };

      await userService.createUser(userData);

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        token: expect.any(String),
        issued: expect.any(Number),
        expires: expect.any(Number),
      });
    });

    test('returns 401 with proper message when user credentials not match', async () => {
      const userData = {
        email: 'mjhajduga1@gmail.com',
        username: 'mjhajduga',
        password: 'password',
      };

      const loginData = {
        email: 'mjhajduga1@gmail.com',
        password: 'wrong password',
      };

      await userService.createUser(userData);

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Password is invalid',
      });
    });

    test('returns 401 with proper message when there is no user matching provided email', async () => {
      const loginData = {
        email: 'mjhajduga1@gmail.com',
        password: 'wrong password',
      };

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'User not exist',
      });
    });

    test('returns 422 with proper message when there is no password passed', async () => {
      const loginData = {
        email: 'mjhajduga1@gmail.com',
      };

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        message: '"password" is required'
      });
    });

    test('returns 422 with proper message when there is no email passed', async () => {
      const loginData = {
        password: 'wrong password',
      };

      const response = await request(app).post('/auth/login').send(loginData);

      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        message: '"email" is required'
      });
    });
  });
});
